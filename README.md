# treasure-hunt-game
Race an intelligent JavaScript agent through a randomized maze. The X is the treasure, blocked cells act as walls, and every board keeps a valid path from start to goal.

# Booty on the Brain: A Deep Q-Learning Treasure Hunt Game

A front-end reinforcement-learning maze demo where a pirate agent learns how to reach treasure by exploring an 8×8 environment, collecting rewards, avoiding penalties, and improving its route through repeated training episodes.

![Treasure Hunt Game mark](./assets/images/treasure-hunt-mark.svg)

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Purpose](#purpose)
- [Features](#features)
- [How the Game Works](#how-the-game-works)
- [Implementation Highlights](#implementation-highlights)
- [Front-End Adaptation](#front-end-adaptation)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [How to Run Locally](#how-to-run-locally)
- [GitHub Pages Deployment](#github-pages-deployment)
- [Customization](#customization)
- [Accessibility](#accessibility)
- [Browser Compatibility](#browser-compatibility)
- [Troubleshooting](#troubleshooting)
- [Related Write-Ups](#related-write-ups)

## Overview

Booty on the Brain is a reinforcement-learning treasure hunt game built around an intelligent pirate agent. The agent learns how to navigate an 8×8 maze, avoid blocked cells, reduce repeated or invalid movement, and reach the treasure by improving its decisions over repeated attempts.

The original version used Python, Jupyter Notebook, NumPy, Keras, Matplotlib, a custom maze environment, and an experience-replay helper. This repository includes that source material in a cleaned public format and adds a browser-based showcase demo built with HTML, CSS, and JavaScript. The demo keeps the same core maze layout, movement directions, reward-driven goal, and reinforcement-learning concept while making the project easier to open, test, and share.

## Live Demo

The application is designed to run as a static site.

When deployed with GitHub Pages, the main demo page is:

```text
https://your-username.github.io/your-repository-name/
```

Supporting pages are included here:

```text
./info.html
./case-study.html
./articles.html
./article.html
./reflection.html
```

The main `index.html` page contains only the interactive app. Project background, case study details, article content, and reflection notes live on separate pages so the demo itself stays focused.

## Purpose

I built this version to make the original AI maze project more accessible as a front-end experience. The notebook version is useful for development and training, but a browser demo lets someone immediately see the environment, move through the maze manually, train the agent, and watch the learned route.

The finished project demonstrates both algorithmic thinking and front-end development. It shows how reinforcement learning can create adaptive behavior, and it also shows how a code-heavy AI workflow can be translated into a polished browser application without requiring a local machine-learning setup.

## Features

- Interactive 8×8 maze inspired by the original environment
- Randomized maze generation with a guaranteed valid route
- Player-vs-agent race to the X treasure
- Easy, Medium, and Hard agent difficulty modes
- Manual movement using buttons, arrow keys, or WASD
- Valid movement checks for walls, boundaries, and available paths
- Reward tracking based on reinforcement-learning feedback
- Agent route behavior that stays inside open cells
- Player trail, agent trail, step counts, shortest route, and race lead
- Game log that summarizes important actions
- Static app architecture with no database or server requirement
- Separate overview, case study, article hub, and reflection pages
- Preserved Python source files in a public-safe source folder

## How the Game Works

The maze is represented as a grid. Open cells are playable paths, and blocked cells are walls. The pirate can move in four directions:

| Action | Meaning |
|---|---|
| Left | Move one cell left |
| Up | Move one cell up |
| Right | Move one cell right |
| Down | Move one cell down |

Every action produces feedback. Reaching the treasure is rewarded, valid movement has a small cost, revisiting cells creates a stronger penalty, and invalid movement is punished more heavily. Over repeated episodes, the agent learns which decisions lead toward the treasure and which decisions waste reward.

## Implementation Highlights

The Python implementation uses a custom maze environment and experience replay. The maze environment defines the board, valid movement rules, visited cells, reward values, and win/loss conditions. The experience-replay logic stores past states, actions, rewards, and next states so the agent can train from a sample of earlier attempts.

The deep Q-learning workflow trains a model to predict the value of possible actions from the current maze state. During training, the agent balances exploration and exploitation. Exploration gives it room to discover new paths, while exploitation lets it use the best route it has learned so far. As training continues, the agent improves its ability to reach the treasure efficiently.

Key development pieces include:

- Resetting the maze from valid starting cells
- Choosing actions through epsilon-greedy decision-making
- Storing episode data for experience replay
- Updating the model from sampled training experiences
- Tracking wins, losses, rewards, path length, and model loss
- Checking whether the agent can successfully reach the treasure from valid positions
- Visualizing the maze and learned behavior

## Front-End Adaptation

The browser version recreates the maze environment with JavaScript classes and a client-side Q-learning trainer. It does not use a database, backend, package manager, or build step. All session activity runs in memory and resets when the page reloads.

The front-end version adds:

- A polished app interface
- Button and keyboard controls
- Training controls
- Live metrics
- Animated path playback
- Project documentation pages
- GitHub Pages-compatible relative paths



## Enhanced Browser Gameplay

The front-end demo now turns the original maze environment into a playable player-versus-agent race. Visitors start in the top-left cell and try to reach the X treasure before the intelligent agent does. The game runs fully in the browser with no database, backend, install step, or saved session state.

### Gameplay Features

- Randomized 8×8 maze generation for each new game
- Guaranteed valid path from the start cell to the X treasure
- Blocked cells that neither the player nor the agent can move through
- Player movement with arrow keys, WASD, or on-screen controls
- Reward tracking based on the original maze environment logic
- Agent trail, player trail, move counts, race lead, and game log

### Agent Difficulty Modes

The intelligent agent uses the same pathfinding rules on every difficulty, but its behavior is tuned to create different gameplay experiences:

| Difficulty | Behavior | Demo Purpose |
| --- | --- | --- |
| Easy | Slower agent, delayed start, more exploratory moves | Lets visitors learn the controls and understand the maze |
| Medium | Balanced speed with occasional exploration | Feels like a fair race against an imperfect trained agent |
| Hard | Fast agent using the optimal route | Shows the agent exploiting the learned path efficiently |

The agent never walks through walls. Difficulty changes its speed, delay, and exploration rate rather than breaking the rules of the maze.

## Project Structure

```text
.
├── index.html
├── info.html
├── case-study.html
├── article.html
├── articles.html
├── reflection.html
├── README.md
├── .nojekyll
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── images/
│   │   └── treasure-hunt-mark.svg
│   └── js/
│       ├── app.js
│       ├── q-agent.js
│       └── treasure-maze.js
├── docs/
│   ├── article.md
│   ├── articles.md
│   ├── original-ai-article.md
│   ├── enhanced-browser-demo-article.md
│   ├── original-vs-demo-comparison.md
│   ├── case-study.md
│   ├── portfolio-content.md
│   └── project-reflection.md
└── source/
    ├── README.md
    └── original-python/
        ├── GameExperience.py
        ├── TreasureMaze.py
        └── TreasureHuntGame.ipynb
```

## Technologies

| Area | Tools |
|---|---|
| Front end | HTML, CSS, JavaScript |
| Original AI workflow | Python, Jupyter Notebook, NumPy, Keras, Matplotlib |
| Learning approach | Deep Q-learning, experience replay, epsilon-greedy exploration |
| Deployment | GitHub Pages or any static host |

## How to Run Locally

No installation is required for the browser demo.

1. Download or clone the repository.
2. Open `index.html` in a browser.
3. Use the manual controls to play the maze or select an episode count and train the agent.

For the original Python notebook, use a Python environment with the required machine-learning dependencies installed. The notebook is included for source reference, while the front-end demo is the easiest version to run quickly.

## GitHub Pages Deployment

This project is ready for GitHub Pages because all paths are relative and the site does not require a server.

1. Upload the repository to GitHub.
2. Open the repository settings.
3. Go to **Pages**.
4. Select the branch you want to publish from.
5. Select the repository root as the publishing folder.
6. Save the settings.

After GitHub Pages finishes publishing, the demo will open from the repository’s Pages URL.

## Customization

Useful places to edit:

| File | Purpose |
|---|---|
| `assets/js/treasure-maze.js` | Maze layout, reward rules, movement logic |
| `assets/js/q-agent.js` | Q-learning trainer and learned path logic |
| `assets/js/app.js` | Interface behavior, controls, metrics, rendering |
| `assets/css/styles.css` | Visual design, layout, colors, responsive behavior |
| `info.html` | Public project overview |
| `case-study.html` | Case study page |
| `article.html` | Technical article page |
| `articles.html` | Article hub with original-version, demo-version, and comparison writing |
| `reflection.html` | Development and ethics reflection page |
| `docs/` | Markdown versions of the write-ups |

## Accessibility

The demo includes semantic page structure, visible buttons, labeled regions, keyboard movement support, status updates, and responsive sizing. The visual maze uses icons and a legend so the board is not dependent on color alone.

## Browser Compatibility

The front-end demo uses standard HTML, CSS, and JavaScript modules. It is intended for current versions of Chrome, Edge, Firefox, and Safari.

## Troubleshooting

| Problem | Fix |
|---|---|
| The page opens but the app does not run | Use a current browser that supports JavaScript modules. |
| GitHub Pages shows a blank page | Make sure the files are published from the repository root and that `.nojekyll` is included. |
| Styling or scripts do not load | Keep the folder structure the same and do not change the relative paths unless the files are moved. |
| Training results vary | The agent uses exploration during training, so some variation between runs is expected. |
| The Python notebook requires dependencies | Install the Python machine-learning packages needed by the notebook, or use the static browser demo instead. |

## Related Write-Ups

- [`info.html`](./info.html) gives a public-facing overview of the project.
- [`case-study.html`](./case-study.html) explains the implementation and browser adaptation.
- [`article.html`](./article.html) explains reinforcement-learning concepts using the maze.
- [`articles.html`](./articles.html) includes the original AI article, the enhanced demo article, and the compare-and-contrast write-up.
- [`reflection.html`](./reflection.html) discusses software development habits, responsible AI, and maintainability.
- [`docs/`](./docs/) contains markdown versions of the portfolio write-ups.


## Branding and Logo

The front-end demo uses `assets/images/treasure-hunt-logo.png` as the primary logo. The interface is styled around that mark: black background, neon-lime path/border accents, white open maze cells, dark blocked cells, and the X as the treasure goal.

To replace the logo later, overwrite:

```text
assets/images/treasure-hunt-logo.png
```

Keep the same filename and path, and the webpage will use the updated version automatically.

## Readable article layout

The article, case study, reflection, and info pages use constrained reading containers so long-form text stays readable on large screens. The CSS limits text width, adds margins, creates card-style content panels, and improves paragraph, list, table, and heading spacing.
