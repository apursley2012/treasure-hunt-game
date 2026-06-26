**Project Articles**

    # From Deep Q-Learning Notebook to Browser-Based Treasure Hunt Demo

    This page brings the project writing together in one place: the original reinforcement-learning article, a new article about the interactive browser demo, and a compare-and-contrast section explaining how the same idea changed when it moved from a Python/Keras training environment into a GitHub Pages-friendly front-end game.

    

    
      
**Article One**

      
## Booty on the Brain: A Deep Q-Learning Treasure Hunt Game

      The original Treasure Hunt Game explores how a reinforcement-learning agent can learn to navigate an 8×8 maze in search of a hidden treasure. The agent is represented as a pirate, but the pirate theme sits on top of a real artificial-intelligence problem: choosing the best action in a grid environment where some moves are useful, some moves waste time, and some moves are invalid because they run into blocked spaces. The project uses a maze matrix, reward values, experience replay, and a neural network to help the agent improve over repeated attempts.

      The maze is built from open and blocked cells. The pirate can move left, up, right, or down, and each move changes the current state of the environment. Reaching the treasure gives the strongest positive reward, while invalid moves, repeated locations, inefficient routes, or failed attempts create penalties. This reward structure gives the agent a reason to prefer actions that move it closer to the goal while avoiding walls and loops. Over time, the agent learns that success is not only about reaching the treasure; it is about reaching the treasure efficiently.

      
### How the environment works

      The environment class controls the world the agent interacts with. It stores the maze, tracks the pirate’s current location, records visited cells, checks valid actions, and returns feedback after each move. This makes the environment responsible for enforcing the rules of the game. The agent does not get to move through walls, leave the board, or ignore the cost of inefficient decisions. Every action produces a new state, a reward or penalty, and a game status that tells the training process whether the attempt is still active, won, or lost.

      The game’s visual layout also matters because the maze is not just an abstract data structure. The board makes the learning process easier to understand. Open cells represent possible routes, blocked cells represent barriers, visited cells show the agent’s history, and the treasure cell marks the final goal. This visual feedback helps connect the code to the behavior it creates.

      
### How the agent learns

      The agent learns through deep Q-learning. Instead of being handed a complete set of instructions for every possible route, it uses repeated attempts to estimate which actions are most valuable from each state. The neural network predicts Q-values for the available actions, and those values guide the agent toward decisions that are expected to produce better long-term outcomes.

      The training loop balances exploration and exploitation. Exploration allows the agent to try actions it may not fully understand yet, which helps it discover routes that could otherwise be missed. Exploitation allows the agent to rely on what it has already learned and choose the action with the strongest predicted value. The epsilon value controls this balance. A higher exploration rate makes the agent more experimental, while a lower exploration rate makes it more confident and direct.

      Experience replay strengthens the learning process by storing earlier episodes and training from a sample of those past experiences. Each memory includes the previous state, the action taken, the reward received, the next state, and the final game status. Training from stored experiences helps reduce instability because the model learns from a wider range of situations instead of only reacting to the newest move.

      
### What the original version demonstrates

      The original version demonstrates how an intelligent agent can improve through feedback. The code shows how the maze state is represented, how rewards shape behavior, how the model predicts action values, and how repeated attempts can turn random exploration into reliable navigation. After enough training, the agent can consistently find a route to the treasure from valid starting positions.

      This version is strongest as a machine-learning implementation. It shows the structure behind reinforcement learning, including environment design, model training, replay memory, action selection, reward tuning, and completion checks. It is also useful because it makes the limitations visible. Training takes time, model behavior depends on hyperparameters, and the quality of the agent depends heavily on how the environment and reward system are designed.

      
### Responsible AI habits

      Even a small maze project reflects larger responsibilities in AI development. The reward structure has to be clear, the rules have to be consistent, and the model’s behavior has to be tested instead of assumed. In higher-stakes systems, those same habits matter even more. Developers need to understand how data, logic, and incentives influence outcomes, especially when algorithmic decisions affect people, resources, or access to services.

      The original project helped reinforce the importance of readable code, documented logic, reproducible behavior, and honest explanation of what a model does and does not prove. A maze-running agent is a contained example, but the habits behind it transfer to larger systems: define the problem carefully, test for unexpected behavior, document limitations, and avoid treating model output as magic.

    

    
      
**Article Two**

      
## Rebuilding the Treasure Hunt Agent as a Playable Front-End Demo

      The enhanced Treasure Hunt demo turns the original reinforcement-learning concept into an interactive browser game. Instead of only watching an agent train inside a Python notebook, visitors can play against a simulated intelligent agent directly in the browser. The player moves through an 8×8 randomized maze, tries to reach the X treasure first, and races against an agent that follows valid movement rules. The result is a portfolio-ready version of the project that keeps the core idea intact while making the experience easier to understand, test, and share.

      The demo is designed for GitHub Pages, so it does not depend on Python, Jupyter Notebook, Keras, TensorFlow, a server, or a database. Everything runs with static front-end files: HTML, CSS, JavaScript, and image assets. This matters because the goal of the demo is not to retrain a neural network in the visitor’s browser. The goal is to translate the original intelligent-agent behavior into a playable, browser-safe experience that communicates the same problem: how an agent navigates a constrained maze toward a goal while following valid movement rules.

      
### Randomized maze generation

      The enhanced demo creates a new 8×8 maze for each game. Randomization makes the project feel more like a real game because the visitor is not memorizing one fixed route. At the same time, the maze generator has to protect the rules of the project. The start cell must be open, the treasure cell must be open, and there must always be at least one valid route between them. A randomized board that traps the player or agent would not be a fair game; it would only be broken logic wearing a fancy hat.

      To prevent that, the front-end version uses path validation after generating a board. If a maze does not contain a valid route from the starting position to the X, the generator discards it and creates another one. That keeps the randomness useful without allowing impossible boards. The game can feel different each round while still staying playable and testable.

      
### Difficulty modes

      The browser demo adds Easy, Medium, and Hard gameplay. These modes adjust the agent’s behavior without changing the basic maze rules. The agent still cannot walk through blocked cells, leave the board, or teleport to the treasure. The difference is how efficiently and aggressively the agent moves toward the goal.

      On Easy, the agent moves more slowly and makes less efficient choices more often, which gives the player more space to learn the controls. On Medium, the agent usually follows a strong route but still leaves room for human reaction time and occasional mistakes. On Hard, the agent behaves much closer to an optimal pathfinder and becomes much harder to beat. These levels make the demo more engaging because visitors can test the same system under different conditions.

      
### Player interaction

      The new version also changes the role of the viewer. In the notebook version, the human mostly observes training results. In the front-end demo, the human becomes part of the system. The player can move with arrow keys, WASD, or on-screen controls. Invalid wall moves cost reward but do not move the player, which keeps the reward system visible and connects the gameplay back to the original reinforcement-learning idea.

      The interface shows the player’s trail, the agent’s trail, step counts, reward changes, shortest route length, race lead, and game status. Those details turn the demo into more than a simple maze game. They help explain the relationship between movement, cost, route efficiency, and goal completion. The visitor can see why a shorter route matters and why blocked moves are punished.

      
### Why the browser version works for a portfolio

      The enhanced version is practical because it runs anywhere GitHub Pages can host static files. A visitor does not need to install Python packages, open a notebook, configure a local environment, or wait for model training. They can load the page, start a race, and immediately understand the project’s main idea. That makes the demo accessible without removing the technical story behind it.

      The browser version also demonstrates software-development skills beyond the original machine-learning code. It includes front-end architecture, modular JavaScript, event handling, accessible controls, state management, randomized content, visual feedback, and responsive layout design. The project becomes a bridge between AI logic and user-facing product design.

    

    
      
**Compare & Contrast**

      
## Original AI Implementation vs. Enhanced Browser Demo

      The original version and the enhanced demo share the same core idea: an agent navigates an 8×8 treasure maze using valid moves and goal-directed decision-making. The difference is the environment where that idea lives. The original version is a Python/Keras implementation focused on training a deep Q-learning agent. The enhanced version is a front-end game focused on making that behavior playable and understandable in a browser.

      
        
          
### Original Version

          
            - Runs in Python/Jupyter Notebook.

            - Uses Keras to build and train a neural network.

            - Focuses on deep Q-learning, experience replay, and model behavior.

            - Uses a fixed 8×8 maze matrix.

            - The human primarily observes the training and test results.

            - Best for demonstrating AI implementation and reinforcement-learning concepts.

          
        
        
          
### Enhanced Demo Version

          
            - Runs as static HTML, CSS, and JavaScript.

            - Uses browser-safe pathfinding and agent behavior simulation.

            - Focuses on playable interaction, visualization, and portfolio accessibility.

            - Creates randomized 8×8 mazes with guaranteed valid routes.

            - The human becomes the player racing the agent to the X treasure.

            - Best for demonstrating front-end development, game logic, and user experience.

          
        
      

      
### What stayed the same

      Both versions preserve the central rules of the project. The maze is still an 8×8 grid. Blocked cells still act as walls. The treasure is still the goal. Movement is still limited to up, down, left, and right. Successful navigation still depends on choosing valid, efficient moves. The project is still about intelligent decision-making in a constrained environment.

      
### What changed

      The biggest change is that the demo does not train a Keras model live in the browser. GitHub Pages cannot run the original Python notebook as a live application, so the enhanced version translates the trained-agent idea into JavaScript gameplay. The browser agent uses valid pathfinding behavior and difficulty-based decision settings to simulate the experience of racing an intelligent agent. That choice keeps the demo lightweight, shareable, and honest about what it is doing.

      
### Why both versions matter

      The original version shows that I can work with machine-learning concepts at the code and model level. The enhanced version shows that I can adapt a technical project into a polished user-facing experience. Together, they tell a stronger story than either version alone: the notebook proves the AI foundation, and the browser demo makes the idea accessible to people who may never open a notebook or install a Python environment.
