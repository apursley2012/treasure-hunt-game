export const LEFT = 0;
export const UP = 1;
export const RIGHT = 2;
export const DOWN = 3;

export const ACTION_NAMES = {
  [LEFT]: "left",
  [UP]: "up",
  [RIGHT]: "right",
  [DOWN]: "down"
};

export const ACTION_DELTAS = {
  [LEFT]: [0, -1],
  [UP]: [-1, 0],
  [RIGHT]: [0, 1],
  [DOWN]: [1, 0]
};

export const ORIGINAL_MAZE = [
  [1, 0, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 0, 1, 1],
  [1, 1, 1, 1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 1],
  [1, 1, 0, 1, 1, 1, 1, 1],
  [1, 1, 1, 0, 1, 0, 0, 0],
  [1, 1, 1, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 1, 1]
];

export function cloneMaze(maze) {
  return maze.map((row) => [...row]);
}

export function key(row, col) {
  return `${row},${col}`;
}

export function sameCell(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

export function shuffle(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function isInside(row, col, rows = 8, cols = 8) {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

export function openNeighborCount(maze, row, col) {
  return Object.values(ACTION_DELTAS).reduce((count, [dr, dc]) => {
    const nextRow = row + dr;
    const nextCol = col + dc;
    return count + (isInside(nextRow, nextCol, maze.length, maze[0].length) && maze[nextRow][nextCol] === 1 ? 1 : 0);
  }, 0);
}

export function findShortestPath(maze, start = [0, 0], target = [maze.length - 1, maze[0].length - 1]) {
  const queue = [start];
  const previous = new Map([[key(start[0], start[1]), null]]);
  const previousAction = new Map();

  while (queue.length) {
    const [row, col] = queue.shift();
    if (sameCell([row, col], target)) break;

    for (const [action, [dr, dc]] of Object.entries(ACTION_DELTAS)) {
      const nextRow = row + dr;
      const nextCol = col + dc;
      const nextKey = key(nextRow, nextCol);

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

  const targetKey = key(target[0], target[1]);
  if (!previous.has(targetKey)) {
    return { path: [], actions: [] };
  }

  const path = [];
  const actions = [];
  let cursor = target;

  while (cursor) {
    path.unshift(cursor);
    const cursorKey = key(cursor[0], cursor[1]);
    const action = previousAction.get(cursorKey);
    if (action !== undefined) actions.unshift(action);
    cursor = previous.get(cursorKey);
  }

  return { path, actions };
}

function carveUniqueMainPath(rows, cols, start, target) {
  const maze = Array.from({ length: rows }, () => Array(cols).fill(0));
  maze[start[0]][start[1]] = 1;

  const path = [start];
  const seen = new Set([key(start[0], start[1])]);
  let attempts = 0;

  while (!sameCell(path[path.length - 1], target) && attempts < 5000) {
    attempts += 1;
    const [row, col] = path[path.length - 1];
    const candidates = shuffle(Object.values(ACTION_DELTAS))
      .map(([dr, dc]) => [row + dr, col + dc])
      .filter(([nextRow, nextCol]) => {
        if (!isInside(nextRow, nextCol, rows, cols)) return false;
        if (seen.has(key(nextRow, nextCol))) return false;
        const neighborCount = openNeighborCount(maze, nextRow, nextCol);
        return neighborCount <= 1;
      })
      .sort((a, b) => {
        const distanceA = Math.abs(a[0] - target[0]) + Math.abs(a[1] - target[1]);
        const distanceB = Math.abs(b[0] - target[0]) + Math.abs(b[1] - target[1]);
        return Math.random() < 0.68 ? distanceA - distanceB : distanceB - distanceA;
      });

    if (!candidates.length) {
      if (path.length <= 1) return null;
      const removed = path.pop();
      seen.delete(key(removed[0], removed[1]));
      maze[removed[0]][removed[1]] = 0;
      continue;
    }

    const next = candidates[0];
    maze[next[0]][next[1]] = 1;
    seen.add(key(next[0], next[1]));
    path.push(next);
  }

  return sameCell(path[path.length - 1], target) ? { maze, path } : null;
}

function addDeadEnds(maze, targetDensity = 0.55) {
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

export function createRandomMaze({ rows = 8, cols = 8, density = 0.55 } = {}) {
  const start = [0, 0];
  const target = [rows - 1, cols - 1];

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

  return { maze: cloneMaze(ORIGINAL_MAZE), solution: findShortestPath(ORIGINAL_MAZE).path };
}

export class TreasureMaze {
  constructor(maze = ORIGINAL_MAZE, player = [0, 0], target = [maze.length - 1, maze[0].length - 1]) {
    this.baseMaze = cloneMaze(maze);
    this.rows = this.baseMaze.length;
    this.cols = this.baseMaze[0].length;
    this.target = [...target];
    this.freeCells = [];

    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        if (this.baseMaze[row][col] === 1 && !this.isTarget(row, col)) {
          this.freeCells.push([row, col]);
        }
      }
    }

    if (this.baseMaze[this.target[0]][this.target[1]] === 0) {
      throw new Error("Invalid maze: target cell cannot be blocked.");
    }

    if (!this.canStandOn(player[0], player[1])) {
      throw new Error("Invalid player location: must sit on an open cell.");
    }

    this.reset(player);
  }

  reset(player = [0, 0]) {
    this.player = [...player];
    this.state = { row: player[0], col: player[1], mode: "start" };
    this.visited = new Set();
    this.totalReward = 0;
    this.minReward = -0.5 * this.rows * this.cols;
    return this.observe();
  }

  key(row, col) {
    return key(row, col);
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
    const row = cell ? cell[0] : this.state.row;
    const col = cell ? cell[1] : this.state.col;

    return [LEFT, UP, RIGHT, DOWN].filter((action) => {
      const [dr, dc] = ACTION_DELTAS[action];
      const nextRow = row + dr;
      const nextCol = col + dc;
      return this.canStandOn(nextRow, nextCol);
    });
  }

  updateState(action) {
    let { row, col } = this.state;
    let mode = this.state.mode;

    if (this.canStandOn(row, col)) {
      this.visited.add(this.key(row, col));
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
  }

  getReward() {
    const { row, col, mode } = this.state;

    if (this.isTarget(row, col)) return 1.0;
    if (mode === "blocked") return this.minReward - 1;
    if (this.visited.has(this.key(row, col))) return -0.25;
    if (mode === "invalid") return -0.75;
    if (mode === "valid") return -0.04;
    return 0;
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
      totalReward: this.totalReward
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
    return {
      maze: cloneMaze(this.baseMaze),
      visited: new Set(this.visited),
      player: [this.state.row, this.state.col],
      target: [...this.target],
      status: this.gameStatus(),
      totalReward: this.totalReward,
      state: { ...this.state },
      ...extra
    };
  }
}
