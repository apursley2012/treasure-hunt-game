# ******************************************************************************
# Treasure Hunt Game                                                           *
# File: /game_experience.py                                                    *
# Purpose: Stores replay transitions and prepares learning targets for the     *
#          original Python training notebook.                                  *
# Author: Alysha Pursley                                                       *
# Copyright: (c) 2026 Alysha Pursley.                                          *
# License: Proprietary; see LICENSE                                            *
# ******************************************************************************
"""Treasure Hunt Game — game_experience.py.

Purpose: Stores replay transitions and prepares learning targets for the original Python training notebook.
Maintainer: Alysha Pursley
Copyright (c) 2026 Alysha Pursley.

This maintained runtime module owns replay-memory storage and Bellman-target
construction so training logic stays separate from maze state transitions and
notebook orchestration.

The notebook and these support modules form the original learning implementation;
this maintainer notice does not establish the provenance of any starter material."""

import numpy as np


class GameExperience:
    """Store state transitions and prepare training batches for the model."""

    def __init__(self, model, max_memory=100, discount=0.95):
        """Configure replay-memory size and future-reward discounting."""
        if not isinstance(max_memory, int) or isinstance(max_memory, bool) or max_memory < 1:
            raise ValueError("max_memory must be a positive integer.")
        if not isinstance(discount, (int, float)) or isinstance(discount, bool):
            raise TypeError("discount must be a numeric value.")
        if not 0.0 <= discount <= 1.0:
            raise ValueError("discount must be between 0 and 1.")

        output_shape = getattr(model, "output_shape", None)
        if (
            not isinstance(output_shape, (tuple, list))
            or not output_shape
            or not isinstance(output_shape[-1], int)
            or isinstance(output_shape[-1], bool)
            or output_shape[-1] < 1
        ):
            raise ValueError("Model must expose a positive integer action count in output_shape.")

        self.model = model
        self.max_memory = max_memory
        self.discount = float(discount)
        self.memory = []
        self.num_actions = model.output_shape[-1]

    def remember(self, experience):
        """Store one [state, action, reward, next_state, game_over] transition."""
        if not isinstance(experience, (list, tuple)) or len(experience) != 5:
            raise ValueError("Experience must contain exactly five transition values.")

        state, action, reward, next_state, game_over = experience
        if not isinstance(action, (int, np.integer)) or isinstance(action, bool):
            raise TypeError("Experience action must be an integer.")
        if not 0 <= int(action) < self.num_actions:
            raise ValueError("Experience action is outside the model action range.")
        if not isinstance(game_over, (bool, np.bool_)):
            raise TypeError("Experience terminal flag must be boolean.")

        state_array = np.asarray(state)
        next_state_array = np.asarray(next_state)
        if not np.issubdtype(state_array.dtype, np.number) or not np.issubdtype(
            next_state_array.dtype, np.number
        ):
            raise TypeError("Experience states must contain numeric values.")
        if np.iscomplexobj(state_array) or np.iscomplexobj(next_state_array):
            raise TypeError("Experience states must contain real numeric values.")
        if state_array.ndim != 2 or state_array.shape[0] != 1:
            raise ValueError("Experience state must have shape (1, environment_size).")
        if next_state_array.shape != state_array.shape:
            raise ValueError("Experience next_state must match the state shape.")
        if not isinstance(reward, (int, float, np.number)) or isinstance(reward, bool):
            raise TypeError("Experience reward must be numeric.")
        if not np.isfinite(reward):
            raise ValueError("Experience reward must be finite.")
        if not np.isfinite(state_array).all() or not np.isfinite(next_state_array).all():
            raise ValueError("Experience states must contain finite numeric values.")

        self.memory.append(
            [
                state_array.copy(),
                int(action),
                float(reward),
                next_state_array.copy(),
                bool(game_over),
            ]
        )

        if len(self.memory) > self.max_memory:
            del self.memory[0]

    def predict(self, envstate):
        """Return the model's action values for one environment state."""
        predictions = np.asarray(self.model.predict(envstate, verbose=0))
        if predictions.shape != (1, self.num_actions):
            raise ValueError(
                f"Model must predict shape (1, {self.num_actions}); got {predictions.shape}."
            )
        if not np.issubdtype(predictions.dtype, np.number) or np.iscomplexobj(predictions):
            raise TypeError("Model predictions must contain real numeric values.")
        if not np.isfinite(predictions).all():
            raise ValueError("Model predictions must contain finite numeric values.")
        return predictions[0].copy()

    def get_data(self, data_size=10):
        """Return a sampled (inputs, targets) training batch.

        Args:
            data_size: Maximum number of distinct replay transitions; must be positive.

        Raises:
            ValueError: If the size is invalid or no transitions are stored.

        The selected action uses a Bellman target; untaken actions retain
        predictions. Terminal transitions have no discounted future value.
        """
        if not isinstance(data_size, int) or isinstance(data_size, bool) or data_size < 1:
            raise ValueError("data_size must be a positive integer.")
        if not self.memory:
            raise ValueError("Cannot create training data from empty replay memory.")

        env_size = self.memory[0][0].shape[1]
        memory_size = len(self.memory)
        data_size = min(memory_size, data_size)

        inputs = np.zeros((data_size, env_size))
        targets = np.zeros((data_size, self.num_actions))

        # Sample without replacement to avoid repeating transitions in a batch.
        sample_indices = np.random.choice(
            range(memory_size),
            data_size,
            replace=False,
        )

        for batch_index, memory_index in enumerate(sample_indices):
            state, action, reward, next_state, game_over = self.memory[memory_index]
            inputs[batch_index] = state

            # Untaken actions keep the model's current predicted values.
            targets[batch_index] = self.predict(state)
            # A terminal transition has no future value. Avoid the unnecessary
            # model prediction for next_state when the episode is finished.
            if game_over:
                targets[batch_index, action] = reward
            else:
                next_q_value = np.max(self.predict(next_state))
                targets[batch_index, action] = (
                    reward + self.discount * next_q_value
                )

        return inputs, targets
