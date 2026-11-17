# Original Treasure Hunt — Deep Q-Learning

I keep my original Python/Jupyter deep Q-learning project here, separate from the browser-based race.

## Files

- `treasure_hunt_game.ipynb`: the learning and evaluation notebook.
- `treasure_maze.py`: maze state, legal moves, rewards, and game status.
- `game_experience.py`: experience-replay memory and training batches.
- `requirements.txt`: Python dependencies.

## Run

From this directory, install the listed dependencies and open the notebook:

```bash
python -m pip install -r requirements.txt
jupyter notebook treasure_hunt_game.ipynb
```

The notebook uses public Keras layer imports and an explicit model input. I have not verified a full training run in a compatible TensorFlow/Keras environment. I need to validate the complete training process before relying on its results.

The public browser game is located in `../`. It uses JavaScript pathfinding rather than executing the notebook's trained neural network.
