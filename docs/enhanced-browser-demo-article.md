**Article Two**

      # Rebuilding the Treasure Hunt Agent as a Playable Front-End Demo

      The enhanced Treasure Hunt demo turns the original reinforcement-learning concept into an interactive browser game. Instead of only watching an agent train inside a Python notebook, visitors can play against a simulated intelligent agent directly in the browser. The player moves through an 8×8 randomized maze, tries to reach the X treasure first, and races against an agent that follows valid movement rules. The result is a portfolio-ready version of the project that keeps the core idea intact while making the experience easier to understand, test, and share.

      The demo is designed for GitHub Pages, so it does not depend on Python, Jupyter Notebook, Keras, TensorFlow, a server, or a database. Everything runs with static front-end files: HTML, CSS, JavaScript, and image assets. This matters because the goal of the demo is not to retrain a neural network in the visitor’s browser. The goal is to translate the original intelligent-agent behavior into a playable, browser-safe experience that communicates the same problem: how an agent navigates a constrained maze toward a goal while following valid movement rules.

      
## Randomized maze generation

      The enhanced demo creates a new 8×8 maze for each game. Randomization makes the project feel more like a real game because the visitor is not memorizing one fixed route. At the same time, the maze generator has to protect the rules of the project. The start cell must be open, the treasure cell must be open, and there must always be at least one valid route between them. A randomized board that traps the player or agent would not be a fair game; it would only be broken logic wearing a fancy hat.

      To prevent that, the front-end version uses path validation after generating a board. If a maze does not contain a valid route from the starting position to the X, the generator discards it and creates another one. That keeps the randomness useful without allowing impossible boards. The game can feel different each round while still staying playable and testable.

      
## Difficulty modes

      The browser demo adds Easy, Medium, and Hard gameplay. These modes adjust the agent’s behavior without changing the basic maze rules. The agent still cannot walk through blocked cells, leave the board, or teleport to the treasure. The difference is how efficiently and aggressively the agent moves toward the goal.

      On Easy, the agent moves more slowly and makes less efficient choices more often, which gives the player more space to learn the controls. On Medium, the agent usually follows a strong route but still leaves room for human reaction time and occasional mistakes. On Hard, the agent behaves much closer to an optimal pathfinder and becomes much harder to beat. These levels make the demo more engaging because visitors can test the same system under different conditions.

      
## Player interaction

      The new version also changes the role of the viewer. In the notebook version, the human mostly observes training results. In the front-end demo, the human becomes part of the system. The player can move with arrow keys, WASD, or on-screen controls. Invalid wall moves cost reward but do not move the player, which keeps the reward system visible and connects the gameplay back to the original reinforcement-learning idea.

      The interface shows the player’s trail, the agent’s trail, step counts, reward changes, shortest route length, race lead, and game status. Those details turn the demo into more than a simple maze game. They help explain the relationship between movement, cost, route efficiency, and goal completion. The visitor can see why a shorter route matters and why blocked moves are punished.

      
## Why the browser version works for a portfolio

      The enhanced version is practical because it runs anywhere GitHub Pages can host static files. A visitor does not need to install Python packages, open a notebook, configure a local environment, or wait for model training. They can load the page, start a race, and immediately understand the project’s main idea. That makes the demo accessible without removing the technical story behind it.

      The browser version also demonstrates software-development skills beyond the original machine-learning code. It includes front-end architecture, modular JavaScript, event handling, accessible controls, state management, randomized content, visual feedback, and responsive layout design. The project becomes a bridge between AI logic and user-facing product design.
