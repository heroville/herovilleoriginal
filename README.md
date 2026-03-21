# HeroVille

A browser-based incremental/idle RPG. Recruit heroes, build your town, craft gear, and send parties into dungeons.

## Stack

- **React 18** + **Redux Toolkit** — UI and state management
- **Vite** — build tool
- **Playwright** — E2E regression tests
- **Vitest** — unit tests
- **Vanilla CSS** with CSS custom properties (dark theme only)

## Getting started

```bash
npm install
npm run dev        # dev server at http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm test` | Build then run Playwright E2E suite |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier format `src/` |

## Architecture

```
src/
  bootstrap.js          # App entry — wires services, store, game API, mounts React
  gameLoopRunner.js     # Tick (work/rest) and save intervals
  container.js          # Manual dependency injection for services
  components/           # React components (one per file, functional only)
  services/             # All game logic (hero, combat, dungeon, production, economy …)
  store/                # Redux store + slices (economy, heroes, dungeons, production …)
  contexts/             # GameContext — provides game API via useGame() hook
  constants/            # gameConfig.data.js (game data), tutorialSteps.js
  styles/               # index.css (CSS variables, dark theme)
```

**State flow:** Services dispatch Redux actions → Redux store → React components read via `useSelector`.

**Game loop:** `gameLoopRunner.js` dispatches tick thunks every N ms (configurable). Each tick calls `HeroService.work()` and `HeroService.rest()`. Auto-save runs every 30 s.

**Save/load:** `localStorage` via `SaveLoadService`. Export/import JSON available in the Options tab.

## Testing

Regression testing is E2E-first. Run `npm test` (builds the app, then Playwright) after any change. Unit tests cover individual services and Redux slices.

For new interactive UI, add `data-testid` attributes on key elements — E2E selectors use these, not CSS classes or text.

## Project rules for AI agents

See [`CLAUDE.md`](./CLAUDE.md).
