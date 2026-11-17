/*
 ******************************************************************************
 * Treasure Hunt Game                                                          *
 * File: /treasure-maze.js                                                     *
 * Purpose: Owns browser maze rules, solvable board generation, and            *
 *          shortest-path search independently of rendering.                   *
 * Author: Alysha Pursley                                                      *
 * Copyright: (c) 2026 Alysha Pursley.                                         *
 * License: Proprietary; see LICENSE                                           *
 ******************************************************************************
 */
export const LEFT = 0;
export const UP = 1;
export const RIGHT = 2;
export const DOWN = 3;

export const ACTION_NAMES = Object.freeze({
	[LEFT]: "left",
	[UP]: "up",
	[RIGHT]: "right",
	[DOWN]: "down",
});

export const ACTION_DELTAS = Object.freeze({
	[LEFT]: [0, -1],
	[UP]: [-1, 0],
	[RIGHT]: [0, 1],
	[DOWN]: [1, 0],
});

/*
 * This fixed maze mirrors the original Python project and is also the safe
 * fallback when randomized generation cannot satisfy the route constraints.
 */
export const ORIGINAL_MAZE = Object.freeze([
	Object.freeze([1, 0, 1, 1, 1, 1, 1, 1]),
	Object.freeze([1, 0, 1, 1, 1, 0, 1, 1]),
	Object.freeze([1, 1, 1, 1, 0, 1, 0, 1]),
	Object.freeze([1, 1, 1, 0, 1, 1, 1, 1]),
	Object.freeze([1, 1, 0, 1, 1, 1, 1, 1]),
	Object.freeze([1, 1, 1, 0, 1, 0, 0, 0]),
	Object.freeze([1, 1, 1, 0, 1, 1, 1, 1]),
	Object.freeze([1, 1, 1, 1, 0, 1, 1, 1]),
]);

const VALID_CELL_VALUES = new Set([0, 1]);

/*
 * Return a mutable row-by-row copy of a maze matrix.
 */
export function cloneMaze(maze) {
	return maze.map((row) => [...row]);
}

/*
 * Convert a row/column coordinate into the string key used by Sets and Maps.
 */
export function cellKey(row, col) {
	return `${row},${col}`;
}

/*
 * Keep `key` as an alias because existing imports may still rely on it.
 * New code uses the more descriptive `cellKey` name.
 */
export const key = cellKey;

export function sameCell(a, b) {
	return a[0] === b[0] && a[1] === b[1];
}

/*
 * Return a shuffled copy without mutating the input array.
 */
export function shuffle(values) {
	const copy = [...values];

	/*
	 * Fisher-Yates keeps the input untouched and gives each candidate a fair
	 * chance before the path generator applies its target-distance bias.
	 */
	for (let index = copy.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
	}

	return copy;
}

export function isInside(row, col, rows = 8, cols = 8) {
	return (
		Number.isInteger(row) &&
		Number.isInteger(col) &&
		row >= 0 &&
		row < rows &&
		col >= 0 &&
		col < cols
	);
}

export function validateMaze(maze) {
	if (!Array.isArray(maze) || maze.length === 0) {
		throw new TypeError("Maze must be a non-empty 2D array.");
	}

	const firstRow = maze[0];
	if (!Array.isArray(firstRow) || firstRow.length === 0) {
		throw new TypeError("Maze rows must be non-empty arrays.");
	}

	const expectedColumns = firstRow.length;

	maze.forEach((row, rowIndex) => {
		if (!Array.isArray(row) || row.length !== expectedColumns) {
			throw new TypeError(
				`Maze row ${rowIndex} must contain exactly ${expectedColumns} cells.`,
			);
		}

		row.forEach((cell, colIndex) => {
			if (!VALID_CELL_VALUES.has(cell)) {
				throw new TypeError(
					`Maze cell at row ${rowIndex}, column ${colIndex} must be 0 (blocked) or 1 (open).`,
				);
			}
		});
	});
}

export function validateCoordinate(coordinate, label, rows, cols) {
	if (
		!Array.isArray(coordinate) ||
		coordinate.length !== 2 ||
		!Number.isInteger(coordinate[0]) ||
		!Number.isInteger(coordinate[1])
	) {
		throw new TypeError(
			`${label} must be a [row, column] integer coordinate.`,
		);
	}

	if (!isInside(coordinate[0], coordinate[1], rows, cols)) {
		throw new RangeError(`${label} must be inside the maze bounds.`);
	}
}

export function openNeighborCount(maze, row, col) {
	return Object.values(ACTION_DELTAS).reduce((count, [dr, dc]) => {
		const nextRow = row + dr;
		const nextCol = col + dc;
		const isOpen =
			isInside(nextRow, nextCol, maze.length, maze[0].length) &&
			maze[nextRow][nextCol] === 1;

		return count + (isOpen ? 1 : 0);
	}, 0);
}

/**
 * Find a shortest route through traversable cells using breadth-first search.
 * @param {number[][]} maze - Rectangular grid of 0 (wall) and 1 (open) cells.
 * @param {[number, number]} [start=[0, 0]] - Starting [row, column].
 * @param {[number, number] | null} [target=null] - Defaults to bottom-right.
 * @returns {{path: number[][], actions: number[]}} Empty arrays if unreachable.
 * @throws {TypeError | RangeError | Error} For invalid grids or endpoints.
 */
export function findShortestPath(maze, start = [0, 0], target = null) {
	validateMaze(maze);

	const rows = maze.length;
	const cols = maze[0].length;
	const resolvedTarget = target ?? [rows - 1, cols - 1];

	validateCoordinate(start, "Start location", rows, cols);
	validateCoordinate(resolvedTarget, "Target location", rows, cols);

	if (maze[start[0]][start[1]] === 0) {
		throw new Error("Invalid start location: must sit on an open cell.");
	}

	if (maze[resolvedTarget[0]][resolvedTarget[1]] === 0) {
		throw new Error("Invalid target location: must sit on an open cell.");
	}

	const queue = [start];
	let queueIndex = 0;
	const previous = new Map([[cellKey(start[0], start[1]), null]]);
	const previousAction = new Map();

	// Using an index avoids Array.shift(), which repeatedly reindexes the queue.
	while (queueIndex < queue.length) {
		const [row, col] = queue[queueIndex];
		queueIndex += 1;

		if (sameCell([row, col], resolvedTarget)) break;

		for (const [action, [dr, dc]] of Object.entries(ACTION_DELTAS)) {
			const nextRow = row + dr;
			const nextCol = col + dc;
			const nextKey = cellKey(nextRow, nextCol);

			if (
				isInside(nextRow, nextCol, maze.length, maze[0].length) &&
				maze[nextRow][nextCol] === 1 &&
				!previous.has(nextKey)
			) {
				previous.set(nextKey, [row, col]);
				previousAction.set(nextKey, Number(action));
				queue.push([nextRow, nextCol]);
			}
		}
	}

	const targetKey = cellKey(resolvedTarget[0], resolvedTarget[1]);
	if (!previous.has(targetKey)) {
		return { path: [], actions: [] };
	}

	const path = [];
	const actions = [];
	let cursor = resolvedTarget;

	/*
	 * Reconstruct backward, then reverse once to avoid repeated array shifts.
	 * Callers receive start-to-target cells and matching actions.
	 */
	while (cursor) {
		path.push(cursor);
		const cursorKey = cellKey(cursor[0], cursor[1]);
		const action = previousAction.get(cursorKey);

		if (action !== undefined) {
			actions.push(action);
		}

		cursor = previous.get(cursorKey);
	}

	path.reverse();
	actions.reverse();
	return { path, actions };
}

function carveUniqueMainPath(rows, cols, start, target) {
	/*
	 * Build one acyclic corridor first. Dead-end branches are added afterward so
	 * every generated board starts from a guaranteed start-to-target backbone.
	 */
	const maze = Array.from({ length: rows }, () => Array(cols).fill(0));
	maze[start[0]][start[1]] = 1;

	const path = [start];
	const seen = new Set([cellKey(start[0], start[1])]);
	let attempts = 0;

	while (!sameCell(path[path.length - 1], target) && attempts < 5000) {
		attempts += 1;
		const [row, col] = path[path.length - 1];

		// Keep the original 68% target preference with a consistent comparator.
		const preferTarget = Math.random() < 0.68;
		const candidates = shuffle(Object.values(ACTION_DELTAS))
			.map(([dr, dc]) => [row + dr, col + dc])
			.filter(([nextRow, nextCol]) => {
				if (!isInside(nextRow, nextCol, rows, cols)) return false;
				if (seen.has(cellKey(nextRow, nextCol))) return false;

				/*
				 * Touching at most one open cell prevents this step from creating a
				 * loop or shortcut across the corridor already carved.
				 */
				return openNeighborCount(maze, nextRow, nextCol) <= 1;
			})
			.sort((a, b) => {
				const distanceA =
					Math.abs(a[0] - target[0]) + Math.abs(a[1] - target[1]);
				const distanceB =
					Math.abs(b[0] - target[0]) + Math.abs(b[1] - target[1]);

				// Choose the direction bias once per sort, not once per comparison.
				// A random comparator is inconsistent and can produce engine-dependent results.
				return preferTarget
					? distanceA - distanceB
					: distanceB - distanceA;
			});

		if (!candidates.length) {
			if (path.length <= 1) return null;

			// Backtrack when the current corridor paints itself into a corner.
			const removed = path.pop();
			seen.delete(cellKey(removed[0], removed[1]));
			maze[removed[0]][removed[1]] = 0;
			continue;
		}

		const next = candidates[0];
		maze[next[0]][next[1]] = 1;
		seen.add(cellKey(next[0], next[1]));
		path.push(next);
	}

	return sameCell(path[path.length - 1], target) ? { maze, path } : null;
}

function addDeadEnds(maze, targetDensity = 0.55) {
	/*
	 * New open cells may attach to exactly one existing open neighbor. This grows
	 * branches without joining two corridors and accidentally creating shortcuts.
	 */
	const rows = maze.length;
	const cols = maze[0].length;
	const targetOpenCells = Math.floor(rows * cols * targetDensity);
	let openCells = maze.flat().filter(Boolean).length;
	let guard = 0;

	while (openCells < targetOpenCells && guard < 900) {
		guard += 1;
		const row = Math.floor(Math.random() * rows);
		const col = Math.floor(Math.random() * cols);

		if (maze[row][col] === 1) continue;

		if (openNeighborCount(maze, row, col) === 1) {
			maze[row][col] = 1;
			openCells += 1;
		}
	}

	return maze;
}

/**
 * Generate a solvable maze, with a deterministic fallback after bounded attempts.
 * @param {{rows?: number, cols?: number, density?: number}} [options]
 * @returns {{maze: number[][], solution: number[][]}} Grid and valid route.
 * @throws {RangeError} For invalid dimensions or density.
 */
export function createRandomMaze({ rows = 8, cols = 8, density = 0.55 } = {}) {
	if (
		!Number.isInteger(rows) ||
		rows < 2 ||
		!Number.isInteger(cols) ||
		cols < 2
	) {
		throw new RangeError(
			"Maze rows and columns must be integers of at least 2.",
		);
	}

	if (!Number.isFinite(density) || density <= 0 || density > 1) {
		throw new RangeError(
			"Maze density must be greater than 0 and no more than 1.",
		);
	}

	const start = [0, 0];
	const target = [rows - 1, cols - 1];

	/*
	 * Random generation is bounded so a pathological random sequence cannot
	 * stall page startup indefinitely.
	 */
	for (let attempt = 0; attempt < 70; attempt += 1) {
		const carved = carveUniqueMainPath(rows, cols, start, target);
		if (!carved) continue;

		const maze = addDeadEnds(carved.maze, density);
		maze[start[0]][start[1]] = 1;
		maze[target[0]][target[1]] = 1;

		const solution = findShortestPath(maze, start, target);
		if (solution.path.length >= 12) {
			return { maze, solution: solution.path };
		}
	}

	/*
	 * Preserve the original 8×8 fallback used by the browser game. For callers
	 * requesting another valid size, return a deterministic corridor of that
	 * exact size instead of unexpectedly substituting an 8×8 board.
	 */
	if (rows === 8 && cols === 8) {
		return {
			maze: cloneMaze(ORIGINAL_MAZE),
			solution: findShortestPath(ORIGINAL_MAZE).path,
		};
	}

	const fallbackMaze = Array.from({ length: rows }, () =>
		Array(cols).fill(0),
	);
	for (let row = 0; row < rows; row += 1) fallbackMaze[row][0] = 1;
	for (let col = 0; col < cols; col += 1) fallbackMaze[rows - 1][col] = 1;

	return {
		maze: fallbackMaze,
		solution: findShortestPath(fallbackMaze, start, target).path,
	};
}

/** Browser maze environment; keeps mutable game state separate from the DOM. */
export class TreasureMaze {
	constructor(maze = ORIGINAL_MAZE, player = [0, 0], target = null) {
		validateMaze(maze);

		this.baseMaze = cloneMaze(maze);
		this.rows = this.baseMaze.length;
		this.cols = this.baseMaze[0].length;
		const resolvedTarget = target ?? [this.rows - 1, this.cols - 1];

		validateCoordinate(player, "Player location", this.rows, this.cols);
		validateCoordinate(
			resolvedTarget,
			"Target location",
			this.rows,
			this.cols,
		);
		this.target = [...resolvedTarget];

		if (this.baseMaze[this.target[0]][this.target[1]] === 0) {
			throw new Error("Invalid maze: target cell cannot be blocked.");
		}

		if (!this.canStandOn(player[0], player[1])) {
			throw new Error(
				"Invalid player location: must sit on an open cell.",
			);
		}

		this.reset(player);
	}

	reset(player = [0, 0]) {
		validateCoordinate(player, "Player location", this.rows, this.cols);

		if (!this.canStandOn(player[0], player[1])) {
			throw new Error(
				"Invalid player location: must sit on an open cell.",
			);
		}

		this.player = [...player];
		this.state = { row: player[0], col: player[1], mode: "start" };
		this.visited = new Set();
		this.totalReward = 0;
		this.minReward = -0.5 * this.rows * this.cols;

		return this.observe();
	}

	isTarget(row, col) {
		return row === this.target[0] && col === this.target[1];
	}

	isInside(row, col) {
		return isInside(row, col, this.rows, this.cols);
	}

	canStandOn(row, col) {
		return this.isInside(row, col) && this.baseMaze[row][col] === 1;
	}

	validActions(cell = null) {
		if (cell !== null) {
			validateCoordinate(cell, "Action location", this.rows, this.cols);
		}
		const row = cell ? cell[0] : this.state.row;
		const col = cell ? cell[1] : this.state.col;

		return [LEFT, UP, RIGHT, DOWN].filter((action) => {
			const [dr, dc] = ACTION_DELTAS[action];
			return this.canStandOn(row + dr, col + dc);
		});
	}

	updateState(action) {
		if (
			!Number.isInteger(action) ||
			!Object.hasOwn(ACTION_DELTAS, action)
		) {
			throw new RangeError(
				"Invalid action: expected LEFT, UP, RIGHT, or DOWN.",
			);
		}

		let { row, col } = this.state;
		let mode = this.state.mode;

		/*
		 * Mark the cell being left before movement. Reward calculation can then
		 * distinguish a move that returns to an already-visited location.
		 */
		if (this.canStandOn(row, col)) {
			this.visited.add(cellKey(row, col));
		}

		const validActions = this.validActions();

		if (!validActions.length) {
			mode = "blocked";
		} else if (validActions.includes(action)) {
			const [dr, dc] = ACTION_DELTAS[action];
			row += dr;
			col += dc;
			mode = "valid";
		} else {
			mode = "invalid";
		}

		this.state = { row, col, mode };
		this.player = [row, col];
	}

	getReward() {
		const { row, col, mode } = this.state;

		/*
		 * Reward precedence is intentional: reaching the treasure wins even if the
		 * cell was previously visited, while revisits retain the original penalty.
		 */
		if (this.isTarget(row, col)) return 1.0;
		if (mode === "blocked") return this.minReward - 1;
		if (this.visited.has(cellKey(row, col))) return -0.25;
		if (mode === "invalid") return -0.75;
		if (mode === "valid") return -0.04;

		// The start state has zero reward before the first move.
		if (mode === "start") return 0;

		throw new Error(`Unknown maze state mode: ${mode}`);
	}

	act(action) {
		this.updateState(action);
		const reward = this.getReward();
		this.totalReward += reward;
		const status = this.gameStatus();

		return {
			envState: this.observe(),
			reward,
			status,
			state: { ...this.state },
			totalReward: this.totalReward,
		};
	}

	gameStatus() {
		if (this.totalReward < this.minReward) return "lose";
		if (this.isTarget(this.state.row, this.state.col)) return "win";
		return "not_over";
	}

	observe() {
		const canvas = cloneMaze(this.baseMaze);
		canvas[this.state.row][this.state.col] = 0.5;
		return canvas.flat();
	}

	snapshot(extra = {}) {
		/*
		 * Clone mutable state so consumers can render/debug without changing the
		 * live environment through shared array or Set references.
		 */
		return {
			maze: cloneMaze(this.baseMaze),
			visited: new Set(this.visited),
			player: [this.state.row, this.state.col],
			target: [...this.target],
			status: this.gameStatus(),
			totalReward: this.totalReward,
			state: { ...this.state },
			...extra,
		};
	}
}
