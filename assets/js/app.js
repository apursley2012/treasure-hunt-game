/*
 ******************************************************************************
 * Treasure Hunt Game                                                          *
 * File: /app.js                                                               *
 * Purpose: Owns the browser race lifecycle: player input, opponent timing,    *
 *          game state coordination, and DOM rendering.                        *
 * Author: Alysha Pursley                                                      *
 * Copyright: (c) 2026 Alysha Pursley.                                         *
 * License: Proprietary; see LICENSE                                           *
 ******************************************************************************
 */
import {
	ACTION_NAMES,
	DOWN,
	LEFT,
	RIGHT,
	TreasureMaze,
	UP,
	cellKey,
	createRandomMaze,
} from "./treasure-maze.js";
import { CompetitiveAgent, DIFFICULTY_SETTINGS } from "./competitive-agent.js";

const MAX_LOG_ENTRIES = 9;
const PLAYER_START = [0, 0];
const AGENT_START = [0, 0];
const TARGET = [7, 7];

const RACE_STATUS = Object.freeze({
	READY: "ready",
	RUNNING: "running",
	PLAYER_WIN: "player-win",
	AGENT_WIN: "agent-win",
});

const STATUS_CONFIG = Object.freeze({
	[RACE_STATUS.READY]: { text: "Ready", className: null },
	[RACE_STATUS.RUNNING]: { text: "Race Running", className: "training" },
	[RACE_STATUS.PLAYER_WIN]: { text: "You Found the X", className: "win" },
	[RACE_STATUS.AGENT_WIN]: { text: "Agent Found the X", className: "lose" },
});

/*
 * Return a required DOM element or fail with a useful error.
 * Keeping DOM lookups explicit makes markup regressions easier to diagnose.
 */
function requireElement(selector) {
	const element = document.querySelector(selector);
	if (!element) {
		throw new Error(`Required element not found: ${selector}`);
	}
	return element;
}

const board = requireElement("#maze-board");
const statusPill = requireElement("#game-status");
const rewardLabel = requireElement("#reward-label");
const playerStepsLabel = requireElement("#player-steps-label");
const agentStepsLabel = requireElement("#agent-steps-label");
const difficultyLabel = requireElement("#difficulty-label");
const pathLengthLabel = requireElement("#path-length-label");
const difficultySelect = requireElement("#difficulty-select");
const difficultyDescription = requireElement("#difficulty-description");
const startButton = requireElement("#start-race");
const newMazeButton = requireElement("#new-maze");
const resetButton = requireElement("#reset-race");
const trainingLog = requireElement("#training-log");
const playerLeadLabel = requireElement("#player-lead-label");
const agentMoveLabel = requireElement("#agent-move-label");

const actionMap = Object.freeze({
	left: LEFT,
	up: UP,
	right: RIGHT,
	down: DOWN,
});

const keyMap = Object.freeze({
	ArrowLeft: LEFT,
	ArrowUp: UP,
	ArrowRight: RIGHT,
	ArrowDown: DOWN,
	a: LEFT,
	w: UP,
	d: RIGHT,
	s: DOWN,
});

/*
 * These values are the live race state. Reset/new-maze flows replace the
 * environment and agent together so the HUD never mixes state from two races.
 */
let mazeData = createRandomMaze();
let env = new TreasureMaze(mazeData.maze, PLAYER_START, TARGET);
let agent = new CompetitiveAgent({
	maze: mazeData.maze,
	difficulty: difficultySelect.value,
	start: AGENT_START,
	target: TARGET,
});
let playerSteps = 0;
let raceTimer = null;
let raceStartTimer = null;
let raceStatus = RACE_STATUS.READY;

function getDifficultySettings() {
	return (
		DIFFICULTY_SETTINGS[difficultySelect.value] ??
		DIFFICULTY_SETTINGS.medium
	);
}

function isRaceRunning() {
	return raceStatus === RACE_STATUS.RUNNING;
}

function isRaceOver() {
	return (
		raceStatus === RACE_STATUS.PLAYER_WIN ||
		raceStatus === RACE_STATUS.AGENT_WIN
	);
}

function log(message) {
	const item = document.createElement("li");
	item.textContent = message;
	trainingLog.prepend(item);

	while (trainingLog.children.length > MAX_LOG_ENTRIES) {
		trainingLog.lastElementChild.remove();
	}
}

function setStatus(status) {
	const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[RACE_STATUS.READY];

	statusPill.className = "status-pill";
	statusPill.textContent = config.text;

	if (config.className) {
		statusPill.classList.add(config.className);
	}
}

function stopAgentTimer() {
	if (raceStartTimer !== null) {
		window.clearTimeout(raceStartTimer);
	}

	if (raceTimer !== null) {
		window.clearInterval(raceTimer);
	}

	raceStartTimer = null;
	raceTimer = null;
}

function createAgent() {
	return new CompetitiveAgent({
		maze: mazeData.maze,
		difficulty: difficultySelect.value,
		start: AGENT_START,
		target: TARGET,
	});
}

/*
 * Recreate race state without changing the current maze or difficulty.
 * Keep reset and new-maze setup in one place so both flows start from the same state.
 */
function initializeRace() {
	stopAgentTimer();
	env = new TreasureMaze(mazeData.maze, PLAYER_START, TARGET);
	agent = createAgent();
	playerSteps = 0;
	raceStatus = RACE_STATUS.READY;
	startButton.disabled = false;
	setStatus(raceStatus);
}

function updateHud() {
	const settings = getDifficultySettings();

	// A positive value means the player has used fewer moves than the agent.
	const lead = agent.steps - playerSteps;

	playerStepsLabel.textContent = String(playerSteps);
	agentStepsLabel.textContent = String(agent.steps);
	rewardLabel.textContent = env.totalReward.toFixed(2);
	difficultyLabel.textContent = settings.label;
	pathLengthLabel.textContent = String(
		Math.max(mazeData.solution.length - 1, 0),
	);
	playerLeadLabel.textContent =
		lead === 0
			? "Even"
			: lead > 0
				? `Player +${lead}`
				: `Agent +${Math.abs(lead)}`;
	agentMoveLabel.textContent = agent.lastMove;
}

function getCellAriaLabel({
	row,
	col,
	isWall,
	isTarget,
	hasPlayer,
	hasAgent,
	wasVisited,
	isAgentTrail,
}) {
	const states = [isWall ? "blocked" : "open"];

	if (isTarget) states.push("treasure");
	if (hasPlayer) states.push("player position");
	if (hasAgent) states.push("agent position");
	if (wasVisited && !hasPlayer) states.push("player trail");
	if (isAgentTrail && !hasAgent) states.push("agent trail");

	return `Row ${row + 1}, column ${col + 1}, ${states.join(", ")}`;
}

function getCellIcon({ isTarget, hasPlayer, hasAgent }) {
	if (hasPlayer && hasAgent) return "●🤖";
	if (hasPlayer) return "●";
	if (hasAgent) return "🤖";
	if (isTarget) return "X";
	return "";
}

function render() {
	board.replaceChildren();

	/*
	 * Render from immutable-style snapshots instead of reading and changing model
	 * state while DOM nodes are being created.
	 */
	const snapshot = env.snapshot({ agent: agent.snapshot() });
	const playerKey = cellKey(snapshot.player[0], snapshot.player[1]);
	const agentKey = cellKey(
		snapshot.agent.position[0],
		snapshot.agent.position[1],
	);
	const targetKey = cellKey(snapshot.target[0], snapshot.target[1]);

	snapshot.maze.forEach((row, rowIndex) => {
		row.forEach((cellValue, colIndex) => {
			const cell = document.createElement("div");
			const currentCellKey = cellKey(rowIndex, colIndex);
			const isWall = cellValue === 0;
			const isTarget = currentCellKey === targetKey;
			const hasPlayer = currentCellKey === playerKey;
			const hasAgent = currentCellKey === agentKey;
			const wasVisited = snapshot.visited.has(currentCellKey);
			const isAgentTrail = snapshot.agent.trail.has(currentCellKey);

			cell.className = "cell";
			cell.setAttribute("role", "img");
			cell.setAttribute(
				"aria-label",
				getCellAriaLabel({
					row: rowIndex,
					col: colIndex,
					isWall,
					isTarget,
					hasPlayer,
					hasAgent,
					wasVisited,
					isAgentTrail,
				}),
			);

			if (isWall) cell.classList.add("wall");
			if (wasVisited) cell.classList.add("visited");
			if (isAgentTrail) cell.classList.add("agent-trail");
			if (isTarget) cell.classList.add("treasure");
			if (hasPlayer) cell.classList.add("player");
			if (hasAgent) cell.classList.add("agent");
			if (hasPlayer && hasAgent) cell.classList.add("both");

			const icon = document.createElement("span");
			icon.className = "cell-icon";
			icon.textContent = getCellIcon({ isTarget, hasPlayer, hasAgent });

			cell.append(icon);
			board.append(cell);
		});
	});

	updateHud();
}

function endRace(status) {
	raceStatus = status;
	stopAgentTimer();
	setStatus(status);
	startButton.disabled = false;

	if (status === RACE_STATUS.PLAYER_WIN) {
		log(
			`Player reached the X first in ${playerSteps} moves. Agent moves: ${agent.steps}.`,
		);
	} else if (status === RACE_STATUS.AGENT_WIN) {
		log(
			`The ${getDifficultySettings().label.toLowerCase()} agent reached the X first in ${agent.steps} moves.`,
		);
	}

	render();
}

function checkWinner() {
	/*
	 * Player and agent moves are processed on separate event/timer turns, so the
	 * mover that reaches the target is resolved before another move can occur.
	 */
	if (env.gameStatus() === "win") {
		endRace(RACE_STATUS.PLAYER_WIN);
		return true;
	}

	if (agent.hasReachedTreasure()) {
		endRace(RACE_STATUS.AGENT_WIN);
		return true;
	}

	return false;
}

function moveAgentOnce() {
	if (!isRaceRunning() || isRaceOver()) return;

	agent.move();
	render();
	checkWinner();
}

function startRace() {
	// Ignore repeated start events while the same race is already running.
	if (isRaceRunning()) return;

	if (isRaceOver()) {
		resetRace(false);
	}

	raceStatus = RACE_STATUS.RUNNING;
	startButton.disabled = true;
	setStatus(raceStatus);

	const settings = getDifficultySettings();
	log(`${settings.label} agent released. ${settings.description}`);

	stopAgentTimer();

	/*
	 * The start delay gives the player the difficulty-specific head start. The
	 * guard also prevents a stale timeout from restarting an already-reset race.
	 */
	raceStartTimer = window.setTimeout(() => {
		raceStartTimer = null;
		if (!isRaceRunning() || isRaceOver()) return;

		moveAgentOnce();
		if (isRaceRunning()) {
			raceTimer = window.setInterval(
				moveAgentOnce,
				agent.settings.moveDelay,
			);
		}
	}, agent.settings.startDelay);
}

function movePlayer(action) {
	if (!isRaceRunning() || isRaceOver()) return;

	const result = env.act(action);

	/*
	 * Bumping into a wall earns the environment penalty but does not count as
	 * forward progress in the race's move comparison.
	 */
	playerSteps += result.state.mode === "invalid" ? 0 : 1;

	log(
		`Player ${ACTION_NAMES[action]}: reward ${result.reward.toFixed(2)}, ` +
			`total ${result.totalReward.toFixed(2)}.`,
	);

	render();
	checkWinner();
}

function configureDifficulty() {
	const settings = getDifficultySettings();
	difficultyDescription.textContent = settings.description;

	agent.configure({
		maze: mazeData.maze,
		difficulty: difficultySelect.value,
		start: AGENT_START,
		target: TARGET,
	});

	render();
}

function resetRace(shouldLog = true) {
	initializeRace();

	if (shouldLog) {
		log("Race reset on the current maze.");
	}

	render();
}

function newMaze() {
	/*
	 * Hard mode opens slightly fewer cells so its faster agent is not paired with
	 * an unusually open board. Solvability is still enforced by createRandomMaze().
	 */
	const density = difficultySelect.value === "hard" ? 0.5 : 0.56;
	mazeData = createRandomMaze({ density });
	initializeRace();

	log(
		`New randomized 8×8 maze loaded. Only valid open cells can be used. ` +
			`Shortest route: ${mazeData.solution.length - 1} moves.`,
	);

	render();
}

document.querySelectorAll("[data-action]").forEach((button) => {
	button.addEventListener("click", () => {
		movePlayer(actionMap[button.dataset.action]);
	});
});

document.addEventListener("keydown", (event) => {
	// Native controls must retain arrow-key navigation (especially the
	// difficulty selector); game shortcuts apply only outside controls.
	const target = event.target;
	if (
		event.altKey ||
		event.ctrlKey ||
		event.metaKey ||
		(target instanceof Element &&
			target.closest(
				"button, input, select, textarea, [contenteditable], [role='combobox'], [role='slider']",
			))
	) {
		return;
	}

	const keyName =
		event.key.length === 1 ? event.key.toLowerCase() : event.key;

	if (keyName in keyMap) {
		// Arrow keys control the game here, so prevent the page from scrolling too.
		event.preventDefault();
		movePlayer(keyMap[keyName]);
	}
});

difficultySelect.addEventListener("change", () => {
	/*
	 * Difficulty changes restart the current race so timing/agent state cannot
	 * switch partway through an active run.
	 */
	resetRace(false);
	configureDifficulty();
	log(`Difficulty changed to ${getDifficultySettings().label}.`);
});

startButton.addEventListener("click", startRace);
newMazeButton.addEventListener("click", newMaze);
resetButton.addEventListener("click", () => resetRace(true));

configureDifficulty();
newMaze();
