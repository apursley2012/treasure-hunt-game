# ******************************************************************************
# Treasure Hunt Game                                                           *
# File: /treasure_maze.py                                                      *
# Purpose: Defines maze state, movement, rewards, and observations for the     *
#          original Python training notebook.                                  *
# Author: Alysha Pursley                                                       *
# Copyright: (c) 2026 Alysha Pursley.                                          *
# License: Proprietary; see LICENSE                                            *
# ******************************************************************************
"""Treasure Hunt Game — treasure_maze.py.

Purpose: Defines maze state, movement, rewards, and observations for the original Python training notebook.
Maintainer: Alysha Pursley
Copyright (c) 2026 Alysha Pursley.

This maintained runtime module owns environment rules used by the original
notebook. Keeping environment behavior here separates state transitions and
reward semantics from neural-network training and visualization orchestration.

The notebook and these support modules form the original learning implementation;
this maintainer notice does not establish the provenance of any starter material."""

import numpy as np

VISITED_MARK = 0.8
PIRATE_MARK = 0.5

LEFT = 0
UP = 1
RIGHT = 2
DOWN = 3


def validate_cell(cell, rows, cols, label):
    """Validate a 2D integer location and return an immutable coordinate."""
    if (
        not isinstance(cell, (tuple, list, np.ndarray))
        or (isinstance(cell, np.ndarray) and cell.ndim != 1)
        or len(cell) != 2
        or any(
            not isinstance(value, (int, np.integer))
            or isinstance(value, (bool, np.bool_))
            for value in cell
        )
    ):
        raise ValueError(f"{label} must be a two-integer (row, column) location.")

    row, col = map(int, cell)
    if not (0 <= row < rows and 0 <= col < cols):
        raise ValueError(f"{label} must be inside the maze.")
    return row, col


class TreasureMaze:
    """Represent a maze environment and track the pirate's current state."""

    def __init__(self, maze, pirate=(0, 0)):
        """Initialize the maze and validate the target and starting cells."""
        try:
            self._maze = np.asarray(maze, dtype=float)
        except (TypeError, ValueError) as exc:
            raise ValueError("Invalid maze: expected a rectangular numeric matrix.") from exc

        if self._maze.ndim != 2 or 0 in self._maze.shape:
            raise ValueError("Invalid maze: expected a non-empty 2D matrix.")
        if not np.isin(self._maze, (0.0, 1.0)).all():
            raise ValueError("Invalid maze: cells must contain only 0 or 1.")

        nrows, ncols = self._maze.shape
        self.target = (nrows - 1, ncols - 1)

        self.free_cells = [
            (row, col)
            for row in range(nrows)
            for col in range(ncols)
            if self._maze[row, col] == 1.0
        ]

        if self._maze[self.target] == 0.0:
            raise ValueError("Invalid maze: target cell cannot be blocked.")

        # The target is valid but is not an allowed starting location.
        self.free_cells.remove(self.target)

        pirate = validate_cell(pirate, nrows, ncols, "Pirate location")
        if pirate not in self.free_cells:
            raise ValueError("Invalid pirate location: must sit on a free cell.")

        self.reset(pirate)

    def reset(self, pirate):
        """Reset the pirate and all episode-level state."""
        pirate = validate_cell(pirate, *self._maze.shape, "Pirate location")
        if pirate not in self.free_cells:
            raise ValueError("Invalid pirate location: must sit on a free cell.")

        self.pirate = pirate
        self.maze = np.copy(self._maze)
        row, col = pirate
        self.maze[row, col] = PIRATE_MARK
        self.state = (row, col, "start")

        # Prevent an episode from continuing indefinitely.
        self.min_reward = -0.5 * self.maze.size
        self.total_reward = 0
        self.visited = set()

    def update_state(self, action):
        """Apply an action and record whether it was valid, invalid, or blocked."""
        if (
            not isinstance(action, (int, np.integer))
            or isinstance(action, (bool, np.bool_))
            or action not in (LEFT, UP, RIGHT, DOWN)
        ):
            raise ValueError("Invalid action: expected LEFT, UP, RIGHT, or DOWN.")

        pirate_row, pirate_col, mode = self.state
        new_row = pirate_row
        new_col = pirate_col
        new_mode = mode

        # Track cells left behind so revisits receive the correct reward.
        if self.maze[pirate_row, pirate_col] > 0.0:
            self.visited.add((pirate_row, pirate_col))

        valid_actions = self.valid_actions()

        if not valid_actions:
            new_mode = "blocked"
        elif action in valid_actions:
            new_mode = "valid"

            if action == LEFT:
                new_col -= 1
            elif action == UP:
                new_row -= 1

            if action == RIGHT:
                new_col += 1
            elif action == DOWN:
                new_row += 1
        else:
            # Invalid actions leave the pirate in place but must update the mode.
            new_mode = "invalid"

        self.state = (new_row, new_col, new_mode)
        self.pirate = (new_row, new_col)

    def get_reward(self):
        """Return the reward defined by the maze movement rules."""
        pirate_row, pirate_col, mode = self.state
        nrows, ncols = self.maze.shape

        # Treasure takes precedence over blocked, revisited, or invalid moves.
        if pirate_row == nrows - 1 and pirate_col == ncols - 1:
            return 1.0
        if mode == "blocked":
            return self.min_reward - 1
        if (pirate_row, pirate_col) in self.visited:
            return -0.25
        if mode == "invalid":
            return -0.75
        if mode == "valid":
            return -0.04

        # The start state has no movement reward before the first action.
        return None

    def act(self, action):
        """Apply one action and return observed state, reward, and game status."""
        self.update_state(action)
        reward = self.get_reward()
        self.total_reward += reward
        status = self.game_status()
        envstate = self.observe()
        return envstate, reward, status

    def observe(self):
        """Return the current maze as a flattened one-row environment state."""
        canvas = self.draw_env()
        return canvas.reshape((1, -1))

    def draw_env(self):
        """Return a visualization matrix without changing the stored maze."""
        canvas = np.copy(self.maze)

        # Normalize markers before placing the pirate to keep observations stable.
        canvas[canvas > 0.0] = 1.0

        row, col, _mode = self.state
        canvas[row, col] = PIRATE_MARK
        return canvas

    def game_status(self):
        """Return win, lose, or not_over according to the maze rules."""
        # End episodes that accumulate too many low-value or invalid actions.
        if self.total_reward < self.min_reward:
            return "lose"

        pirate_row, pirate_col, _mode = self.state
        nrows, ncols = self.maze.shape

        if pirate_row == nrows - 1 and pirate_col == ncols - 1:
            return "win"

        return "not_over"

    def valid_actions(self, cell=None):
        """Return all actions that stay within bounds and avoid blocked cells."""
        if cell is None:
            row, col, _mode = self.state
        else:
            row, col = validate_cell(cell, *self._maze.shape, "Action location")

        if self._maze[row, col] == 0.0:
            raise ValueError("Action location must be a free cell.")

        actions = [LEFT, UP, RIGHT, DOWN]
        nrows, ncols = self.maze.shape

        if row == 0:
            actions.remove(UP)
        elif row == nrows - 1:
            actions.remove(DOWN)

        if col == 0:
            actions.remove(LEFT)
        elif col == ncols - 1:
            actions.remove(RIGHT)

        if row > 0 and self.maze[row - 1, col] == 0.0:
            actions.remove(UP)
        if row < nrows - 1 and self.maze[row + 1, col] == 0.0:
            actions.remove(DOWN)

        if col > 0 and self.maze[row, col - 1] == 0.0:
            actions.remove(LEFT)
        if col < ncols - 1 and self.maze[row, col + 1] == 0.0:
            actions.remove(RIGHT)

        return actions
