/*
 ******************************************************************************
 * Treasure Hunt Game                                                          *
 * File: /competitive-agent.js                                                 *
 * Purpose: Owns the browser opponent strategy and difficulty behavior;        *
 *          pathfinding stays in the maze module.                              *
 * Author: Alysha Pursley                                                      *
 * Copyright: (c) 2026 Alysha Pursley.                                         *
 * License: Proprietary; see LICENSE                                           *
 ******************************************************************************
 */
import {
	ACTION_DELTAS,
	ACTION_NAMES,
	cellKey,
	findShortestPath,
	validateCoordinate,
	validateMaze,
} from "./treasure-maze.js";

/*
 * Difficulty changes timing and decision noise only; every level uses the
 * same maze rules and shortest-path implementation.
 */
export const DIFFICULTY_SETTINGS = Object.freeze({
	easy: Object.freeze({
		label: "Easy",
		moveDelay: 1150,
		startDelay: 1600,
		mistakeRate: 0.42,
		hesitateRate: 0.2,
		description:
			"The agent explores more, hesitates sometimes, and gives the player a head start.",
	}),
	medium: Object.freeze({
		label: "Medium",
		moveDelay: 780,
		startDelay: 900,
		mistakeRate: 0.18,
		hesitateRate: 0.08,
		description:
			"The agent usually follows the shortest route but still makes occasional exploration choices.",
	}),
	hard: Object.freeze({
		label: "Hard",
		moveDelay: 470,
		startDelay: 350,
		mistakeRate: 0,
		hesitateRate: 0,
		description:
			"The agent exploits the optimal path aggressively and rarely gives the player breathing room.",
	}),
});

function normalizeDifficulty(difficulty) {
	if (!Object.hasOwn(DIFFICULTY_SETTINGS, difficulty)) {
		throw new RangeError("Difficulty must be easy, medium, or hard.");
	}
	return difficulty;
}

/*
 * Browser race agent.
 *
 * The browser agent follows the current shortest route most of the time and
 * uses the configured difficulty rates to hesitate or explore valid alternatives.
 * It is separate from the Python reinforcement-learning source.
 */
export class CompetitiveAgent {
	constructor({
		maze,
		difficulty = "medium",
		start = [0, 0],
		target = null,
	} = {}) {
		this.configure({ maze, difficulty, start, target });
	}

	configure({ maze, difficulty = "medium", start = [0, 0], target = null }) {
		validateMaze(maze);

		const rows = maze.length;
		const cols = maze[0].length;
		const resolvedTarget = target ?? [rows - 1, cols - 1];
		validateCoordinate(start, "Agent start", rows, cols);
		validateCoordinate(resolvedTarget, "Agent target", rows, cols);

		if (
			maze[start[0]][start[1]] !== 1 ||
			maze[resolvedTarget[0]][resolvedTarget[1]] !== 1
		) {
			throw new Error("Agent start and target must be on open cells.");
		}

		const normalizedDifficulty = normalizeDifficulty(difficulty);

		// Own the grid so external mutations cannot change an active race.
		this.maze = maze.map((row) => [...row]);
		this.difficulty = normalizedDifficulty;
		this.settings = DIFFICULTY_SETTINGS[normalizedDifficulty];
		this.start = [...start];
		this.position = [...start];
		this.target = [...resolvedTarget];
		this.trail = new Set([cellKey(start[0], start[1])]);
		this.steps = 0;
		this.lastMove = "waiting";
		this.policy = findShortestPath(this.maze, this.position, this.target);
		if (!this.policy.path.length) {
			throw new RangeError(
				"Agent target must be reachable from its start.",
			);
		}

		return this;
	}

	validActions(from = this.position) {
		validateCoordinate(
			from,
			"Agent position",
			this.maze.length,
			this.maze[0].length,
		);
		const [row, col] = from;

		return Object.entries(ACTION_DELTAS)
			.map(([action, [dr, dc]]) => ({
				action: Number(action),
				row: row + dr,
				col: col + dc,
			}))
			.filter(({ row: nextRow, col: nextCol }) => {
				return (
					nextRow >= 0 &&
					nextRow < this.maze.length &&
					nextCol >= 0 &&
					nextCol < this.maze[0].length &&
					this.maze[nextRow][nextCol] === 1
				);
			});
	}

	chooseExplorationMove() {
		const valid = this.validActions();
		if (!valid.length) return null;

		/*
		 * Exploration prefers unseen cells so a "mistake" still looks like
		 * meaningful exploration instead of immediately bouncing backward.
		 */
		const unvisited = valid.filter(
			({ row, col }) => !this.trail.has(cellKey(row, col)),
		);
		const pool = unvisited.length ? unvisited : valid;

		return pool[Math.floor(Math.random() * pool.length)];
	}

	choosePolicyMove() {
		/*
		 * Recalculate after every move because exploration can move the agent away
		 * from the route that was optimal on the previous turn.
		 */
		this.policy = findShortestPath(this.maze, this.position, this.target);

		const nextCell = this.policy.path[1];
		if (!nextCell) return null;

		return (
			this.validActions().find(
				({ row, col }) => row === nextCell[0] && col === nextCell[1],
			) ?? null
		);
	}

	/*
	 * Keep one predictable fallback order and report the strategy that
	 * actually supplied the chosen move.
	 */
	chooseMove(useExploration) {
		if (useExploration) {
			const explorationMove = this.chooseExplorationMove();
			if (explorationMove) {
				return { move: explorationMove, strategy: "explored" };
			}

			const policyMove = this.choosePolicyMove();
			if (policyMove) {
				return { move: policyMove, strategy: "exploited" };
			}
		} else {
			const policyMove = this.choosePolicyMove();
			if (policyMove) {
				return { move: policyMove, strategy: "exploited" };
			}

			const explorationMove = this.chooseExplorationMove();
			if (explorationMove) {
				return { move: explorationMove, strategy: "explored" };
			}
		}

		return { move: null, strategy: null };
	}

	move() {
		if (this.hasReachedTreasure()) {
			return this.snapshot();
		}

		/*
		 * Hesitation consumes a timer turn but not a maze step. This is what lets
		 * easier levels slow down without changing movement or reward rules.
		 */
		if (Math.random() < this.settings.hesitateRate) {
			this.lastMove = "hesitated";
			return this.snapshot();
		}

		// "Mistake" means take a valid exploratory move, never walk through walls.
		const useExploration = Math.random() < this.settings.mistakeRate;
		const { move, strategy } = this.chooseMove(useExploration);

		if (!move) {
			this.lastMove = "blocked";
			return this.snapshot();
		}

		this.position = [move.row, move.col];
		this.trail.add(cellKey(move.row, move.col));
		this.steps += 1;
		this.lastMove = `${strategy} ${ACTION_NAMES[move.action]}`;

		return this.snapshot();
	}

	hasReachedTreasure() {
		return (
			this.position[0] === this.target[0] &&
			this.position[1] === this.target[1]
		);
	}

	/*
	 * Return the number of cells in the optimal path.
	 * This method counts cells because existing callers rely on that convention.
	 */
	optimalPathLength() {
		return findShortestPath(this.maze, this.start, this.target).path.length;
	}

	/*
	 * Return the number of moves required by the optimal route.
	 */
	optimalMoveCount() {
		return Math.max(this.optimalPathLength() - 1, 0);
	}

	snapshot() {
		// Copy mutable collections so rendering code cannot mutate agent state.
		return {
			position: [...this.position],
			trail: new Set(this.trail),
			steps: this.steps,
			lastMove: this.lastMove,
			difficulty: this.difficulty,
			settings: this.settings,
			policy: {
				path: this.policy.path.map((cell) => [...cell]),
				actions: [...this.policy.actions],
			},
		};
	}
}
