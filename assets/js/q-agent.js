import { ACTION_DELTAS, ACTION_NAMES, findShortestPath, key } from "./treasure-maze.js";

export const DIFFICULTY_SETTINGS = {
  easy: {
    label: "Easy",
    moveDelay: 1150,
    startDelay: 1600,
    mistakeRate: 0.42,
    hesitateRate: 0.2,
    description: "The agent explores more, hesitates sometimes, and gives the player a head start."
  },
  medium: {
    label: "Medium",
    moveDelay: 780,
    startDelay: 900,
    mistakeRate: 0.18,
    hesitateRate: 0.08,
    description: "The agent usually follows the learned route but still makes occasional exploration choices."
  },
  hard: {
    label: "Hard",
    moveDelay: 470,
    startDelay: 350,
    mistakeRate: 0,
    hesitateRate: 0,
    description: "The agent exploits the optimal path aggressively and rarely gives the player breathing room."
  }
};

export class CompetitiveAgent {
  constructor({ maze, difficulty = "medium", start = [0, 0], target = [7, 7] } = {}) {
    this.configure({ maze, difficulty, start, target });
  }

  configure({ maze, difficulty = "medium", start = [0, 0], target = [7, 7] }) {
    this.maze = maze;
    this.difficulty = difficulty;
    this.settings = DIFFICULTY_SETTINGS[difficulty] ?? DIFFICULTY_SETTINGS.medium;
    this.position = [...start];
    this.target = [...target];
    this.trail = new Set([key(start[0], start[1])]);
    this.steps = 0;
    this.lastMove = "waiting";
    this.policy = findShortestPath(this.maze, this.position, this.target);
    return this;
  }

  validActions(from = this.position) {
    const [row, col] = from;
    return Object.entries(ACTION_DELTAS)
      .map(([action, [dr, dc]]) => ({ action: Number(action), row: row + dr, col: col + dc }))
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

    const unvisited = valid.filter(({ row, col }) => !this.trail.has(key(row, col)));
    const pool = unvisited.length ? unvisited : valid;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  choosePolicyMove() {
    this.policy = findShortestPath(this.maze, this.position, this.target);
    const nextCell = this.policy.path[1];
    if (!nextCell) return null;

    const valid = this.validActions();
    return valid.find(({ row, col }) => row === nextCell[0] && col === nextCell[1]) ?? null;
  }

  move() {
    if (Math.random() < this.settings.hesitateRate) {
      this.lastMove = "hesitated";
      return this.snapshot();
    }

    const useExploration = Math.random() < this.settings.mistakeRate;
    const move = useExploration ? this.chooseExplorationMove() : this.choosePolicyMove();
    const safeMove = move ?? this.choosePolicyMove() ?? this.chooseExplorationMove();

    if (!safeMove) {
      this.lastMove = "blocked";
      return this.snapshot();
    }

    this.position = [safeMove.row, safeMove.col];
    this.trail.add(key(safeMove.row, safeMove.col));
    this.steps += 1;
    this.lastMove = `${useExploration ? "explored" : "exploited"} ${ACTION_NAMES[safeMove.action]}`;
    return this.snapshot();
  }

  hasReachedTreasure() {
    return this.position[0] === this.target[0] && this.position[1] === this.target[1];
  }

  optimalPathLength() {
    return findShortestPath(this.maze, [0, 0], this.target).path.length;
  }

  snapshot() {
    return {
      position: [...this.position],
      trail: new Set(this.trail),
      steps: this.steps,
      lastMove: this.lastMove,
      difficulty: this.difficulty,
      settings: this.settings,
      policy: this.policy
    };
  }
}
