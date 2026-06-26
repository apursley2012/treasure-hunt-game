import { ACTION_NAMES, DOWN, LEFT, RIGHT, TreasureMaze, UP, createRandomMaze, findShortestPath, key } from "./treasure-maze.js";
import { CompetitiveAgent, DIFFICULTY_SETTINGS } from "./q-agent.js";

const board = document.querySelector("#maze-board");
const statusPill = document.querySelector("#game-status");
const rewardLabel = document.querySelector("#reward-label");
const playerStepsLabel = document.querySelector("#player-steps-label");
const agentStepsLabel = document.querySelector("#agent-steps-label");
const difficultyLabel = document.querySelector("#difficulty-label");
const pathLengthLabel = document.querySelector("#path-length-label");
const difficultySelect = document.querySelector("#difficulty-select");
const difficultyDescription = document.querySelector("#difficulty-description");
const startButton = document.querySelector("#start-race");
const newMazeButton = document.querySelector("#new-maze");
const resetButton = document.querySelector("#reset-race");
const trainingLog = document.querySelector("#training-log");
const playerLeadLabel = document.querySelector("#player-lead-label");
const agentMoveLabel = document.querySelector("#agent-move-label");

const actionMap = { left: LEFT, up: UP, right: RIGHT, down: DOWN };
const keyMap = { ArrowLeft: LEFT, ArrowUp: UP, ArrowRight: RIGHT, ArrowDown: DOWN, a: LEFT, w: UP, d: RIGHT, s: DOWN };
const target = [7, 7];
const playerStart = [0, 0];
const agentStart = [0, 0];

let mazeData = createRandomMaze();
let env = new TreasureMaze(mazeData.maze, playerStart, target);
let agent = new CompetitiveAgent({ maze: mazeData.maze, difficulty: difficultySelect.value, start: agentStart, target });
let playerSteps = 0;
let raceTimer = null;
let raceActive = false;
let raceOver = false;

function log(message) {
  const item = document.createElement("li");
  item.textContent = message;
  trainingLog.prepend(item);
  while (trainingLog.children.length > 9) {
    trainingLog.lastElementChild.remove();
  }
}

function setStatus(status) {
  statusPill.className = "status-pill";

  if (status === "player-win") {
    statusPill.textContent = "You Found the X";
    statusPill.classList.add("win");
  } else if (status === "agent-win") {
    statusPill.textContent = "Agent Found the X";
    statusPill.classList.add("lose");
  } else if (status === "running") {
    statusPill.textContent = "Race Running";
    statusPill.classList.add("training");
  } else if (status === "stopped") {
    statusPill.textContent = "Paused";
  } else {
    statusPill.textContent = "Ready";
  }
}

function stopAgentTimer() {
  if (raceTimer) window.clearInterval(raceTimer);
  raceTimer = null;
}

function updateHud() {
  const optimalPath = findShortestPath(mazeData.maze, playerStart, target);
  const lead = agent.steps - playerSteps;
  playerStepsLabel.textContent = String(playerSteps);
  agentStepsLabel.textContent = String(agent.steps);
  rewardLabel.textContent = env.totalReward.toFixed(2);
  difficultyLabel.textContent = DIFFICULTY_SETTINGS[difficultySelect.value].label;
  pathLengthLabel.textContent = String(Math.max(optimalPath.path.length - 1, 0));
  playerLeadLabel.textContent = lead === 0 ? "Even" : lead > 0 ? `Player +${lead}` : `Agent +${Math.abs(lead)}`;
  agentMoveLabel.textContent = agent.lastMove;
}

function render() {
  board.innerHTML = "";
  const snapshot = env.snapshot({ agent: agent.snapshot() });
  const playerKey = key(snapshot.player[0], snapshot.player[1]);
  const agentKey = key(snapshot.agent.position[0], snapshot.agent.position[1]);
  const targetKey = key(snapshot.target[0], snapshot.target[1]);

  snapshot.maze.forEach((row, rowIndex) => {
    row.forEach((cellValue, colIndex) => {
      const cell = document.createElement("div");
      const cellKey = key(rowIndex, colIndex);
      cell.className = "cell";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `Row ${rowIndex + 1}, column ${colIndex + 1}`);

      if (cellValue === 0) cell.classList.add("wall");
      if (snapshot.visited.has(cellKey)) cell.classList.add("visited");
      if (snapshot.agent.trail.has(cellKey)) cell.classList.add("agent-trail");
      if (cellKey === targetKey) cell.classList.add("treasure");
      if (cellKey === playerKey) cell.classList.add("player");
      if (cellKey === agentKey) cell.classList.add("agent");
      if (cellKey === playerKey && cellKey === agentKey) cell.classList.add("both");

      const icon = document.createElement("span");
      icon.className = "cell-icon";

      if (cellKey === targetKey) icon.textContent = "X";
      if (cellKey === agentKey) icon.textContent = "🤖";
      if (cellKey === playerKey) icon.textContent = "●";
      if (cellKey === playerKey && cellKey === agentKey) icon.textContent = "●🤖";

      cell.append(icon);
      board.append(cell);
    });
  });

  updateHud();
}

function endRace(status) {
  raceActive = false;
  raceOver = true;
  stopAgentTimer();
  setStatus(status);
  startButton.disabled = false;

  if (status === "player-win") {
    log(`Player reached the X first in ${playerSteps} moves. Agent moves: ${agent.steps}.`);
  } else if (status === "agent-win") {
    log(`The ${DIFFICULTY_SETTINGS[difficultySelect.value].label.toLowerCase()} agent reached the X first in ${agent.steps} moves.`);
  }

  render();
}

function checkWinner() {
  if (env.gameStatus() === "win") {
    endRace("player-win");
    return true;
  }

  if (agent.hasReachedTreasure()) {
    endRace("agent-win");
    return true;
  }

  return false;
}

function moveAgentOnce() {
  if (!raceActive || raceOver) return;
  agent.move();
  render();
  checkWinner();
}

function startRace() {
  if (raceOver) resetRace(false);
  raceActive = true;
  startButton.disabled = true;
  setStatus("running");
  log(`${DIFFICULTY_SETTINGS[difficultySelect.value].label} agent released. ${DIFFICULTY_SETTINGS[difficultySelect.value].description}`);

  stopAgentTimer();
  window.setTimeout(() => {
    if (!raceActive || raceOver) return;
    moveAgentOnce();
    raceTimer = window.setInterval(moveAgentOnce, agent.settings.moveDelay);
  }, agent.settings.startDelay);
}

function movePlayer(action) {
  if (!raceActive || raceOver) return;
  const result = env.act(action);
  playerSteps += result.state.mode === "invalid" ? 0 : 1;
  log(`Player ${ACTION_NAMES[action]}: reward ${result.reward.toFixed(2)}, total ${result.totalReward.toFixed(2)}.`);
  render();
  checkWinner();
}

function configureDifficulty() {
  const settings = DIFFICULTY_SETTINGS[difficultySelect.value];
  difficultyDescription.textContent = settings.description;
  agent.configure({ maze: mazeData.maze, difficulty: difficultySelect.value, start: agentStart, target });
  render();
}

function resetRace(shouldLog = true) {
  stopAgentTimer();
  env = new TreasureMaze(mazeData.maze, playerStart, target);
  agent = new CompetitiveAgent({ maze: mazeData.maze, difficulty: difficultySelect.value, start: agentStart, target });
  playerSteps = 0;
  raceActive = false;
  raceOver = false;
  startButton.disabled = false;
  setStatus("ready");
  if (shouldLog) log("Race reset on the current maze.");
  render();
}

function newMaze() {
  stopAgentTimer();
  mazeData = createRandomMaze({ density: difficultySelect.value === "hard" ? 0.5 : 0.56 });
  env = new TreasureMaze(mazeData.maze, playerStart, target);
  agent = new CompetitiveAgent({ maze: mazeData.maze, difficulty: difficultySelect.value, start: agentStart, target });
  playerSteps = 0;
  raceActive = false;
  raceOver = false;
  startButton.disabled = false;
  setStatus("ready");
  const route = findShortestPath(mazeData.maze, playerStart, target);
  log(`New randomized 8×8 maze loaded. Only valid open cells can be used. Shortest route: ${route.path.length - 1} moves.`);
  render();
}

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => movePlayer(actionMap[button.dataset.action]));
});

document.addEventListener("keydown", (event) => {
  const keyName = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (keyName in keyMap) {
    event.preventDefault();
    movePlayer(keyMap[keyName]);
  }
});

difficultySelect.addEventListener("change", () => {
  resetRace(false);
  configureDifficulty();
  log(`Difficulty changed to ${DIFFICULTY_SETTINGS[difficultySelect.value].label}.`);
});

startButton.addEventListener("click", startRace);
newMazeButton.addEventListener("click", newMaze);
resetButton.addEventListener("click", () => resetRace(true));

configureDifficulty();
newMaze();
