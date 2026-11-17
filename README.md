# Treasure Hunt Game

## About my project

My portfolio demo is the **static browser maze race** at the repository root. It runs in the browser using HTML, CSS and JavaScript modules, including a JavaScript shortest-path opponent. It does **not** run the Python/Jupyter deep Q-learning model, serve a Python backend, authenticate users, or persist data to a database.

I keep the separate Python/Jupyter learning implementation in `Original/`. See `Original/README.md` for its notebook instructions and compatibility caveat.

The site includes a dedicated development case study and four individual articles covering deep Q-learning, browser implementation, neural networks, and privacy-aware AI. The Articles page is an index rather than a single page containing every article.

## Source layout and ownership

I keep two **independent** implementations in this repository, not a source/build pair. I maintain the browser demo directly as readable HTML, CSS, and JavaScript; there is no generated `dist/` directory or frontend build step.

| Location | Maintained responsibility |
| --- | --- |
| `Original/treasure_maze.py` | Original Python maze environment and rewards |
| `Original/game_experience.py` | Original Python replay-memory training support |
| `Original/treasure_hunt_game.ipynb` | Original Jupyter deep Q-learning notebook |
| `pages/` | Individual static pages and playable game markup |
| `assets/js/app.js` | Browser game UI, controls, and race orchestration |
| `assets/js/treasure-maze.js` | Browser maze rules, generation, and pathfinding |
| `assets/js/competitive-agent.js` | Browser opponent decision-making |
| `assets/js/components/` | Shared page shell, navigation, links, and path helpers |
| `assets/css/core/` | Shared design tokens and base rules |
| `assets/css/components/` | Shared component styles |
| `assets/css/` | Page/feature-specific stylesheets |
| `assets/images/` | Browser image and icon assets |

The root redirect, 404 page, web manifest, robots file, and sitemap belong to the static hosting entry point. Python bytecode caches (`__pycache__/`, `*.pyc`) are generated locally and are not source files. I exclude them from the published repository.

## GitHub Pages deployment

I publish the static site from the repository root using GitHub Pages' built-in branch publishing, so there is no GitHub Actions workflow or frontend build step in this repository.

1. I push the contents of `treasure-hunt-game/` to the root of my GitHub repository's `main` branch.
2. In **Settings → Pages → Build and deployment**, I select **Deploy from a branch**, choose **main** and the **/(root)** folder, and save.
3. I open the Pages URL and check the game, navigation, mobile menu, reset/new maze controls, and direct links to each informational page. I also check that a missing URL displays the themed 404 page.

The local HTML, CSS, and JavaScript can also be previewed without GitHub Actions. The published site uses no backend and stores no accounts or database records.

## Local static preview

To preview the site locally from the repository root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. A local HTTP server is required for reliable JavaScript module loading; opening the HTML directly as a `file://` URL may be blocked by browser security rules. No Node build or package installation is needed for the browser demo. The deployed app does not run Python or Node.js on the server.

The browser demo targets current evergreen desktop and mobile browsers supporting JavaScript modules and modern DOM APIs. I check browser and device compatibility separately, including keyboard controls, touch input, page layout, and accessibility.

## Repository-subpath behavior

The site uses relative URLs for CSS, scripts, images, icons and internal navigation. It can therefore be hosted under a repository URL such as `https://username.github.io/repository-name/`. The root `index.html` redirects to `pages/index.html`. GitHub Pages serves the static `404.html` for missing paths. This is a multi-page static site, **not** an SPA that needs client-side routing or a development server.

The HTML contains canonical/social URLs for the project repository's existing GitHub Pages address. If publishing under a different repository, I need to update those public metadata URLs for the new destination. They are not local asset URLs and do not control navigation.

## Python notebook runtime

The notebook metadata identifies the historical Python 3.7.4 environment. The notebook's Keras layer imports now use public module paths, and the model declares an explicit input layer. Its `requirements.txt` does not pin a reproducible TensorFlow/Keras environment, and I have not verified a complete training run with the current TensorFlow/Keras versions. I need to confirm compatibility in my target Python environment before relying on training results. The notebook is part of the original source, not the deployed browser game.

## Licensing, attribution, and site policies

My repository's `LICENSE` sets out my proprietary terms for contributions I own, including permissions for public GitHub viewing and restrictions on commercial reuse. It is **not** an open-source license. Contact me using the email in `LICENSE` to request written permission for reuse.

`THIRD_PARTY_NOTICES.md` identifies only externally provided Python dependencies, font families, and the Google Fonts service. Their respective licenses apply independently of my project's proprietary terms. The rights and origin of any historical educational starter material in `Original/` have not been independently established, so I do not claim ownership of that material.

The static website includes `pages/privacy.html`, `pages/terms.html`, `pages/accessibility.html`, and a site-themed `404.html`. The 404 page anchors its asset and navigation URLs to the deployment root so nested missing routes do not break the shared site design. Its production repository path is `/treasure-hunt-game/`; update that path if deploying under a different repository name.
