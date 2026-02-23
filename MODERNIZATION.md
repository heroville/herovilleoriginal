# Heroville Modernization Roadmap

This document outlines the two-phase plan to bring Heroville from its current state to a clean, maintainable codebase and eventually to a modern framework.

---

## Current State Summary

| Area | Current state |
|------|----------------|
| **HTML** | Single ~530-line `index.html` with all UI, inline `<script type="text/ng-template">` blocks, and a small GA script |
| **JS** | One ~2,133-line `maincontroller.js` (MainController + most game logic), plus `app.js` (directives/filters), small config and economy service |
| **Libraries** | From npm: jquery, jquery-ui-dist, bootstrap, angular, angular-animate, angular-ui-bootstrap, angulartics, angulartics-google-analytics (see `package.json`). Load order in `src/vendor/jquery-global.js` and `src/main.js`. |
| **Styles** | Bootstrap, jQuery UI custom, `newStyle.css`, `darkStyle.css` in `public/styles/` |
| **Build** | Vite with ng-annotate; entry is `src/main.js` |

**Already in good shape:**  
- Vite is in place; `main.js` uses ES modules and imports app, config, economy service, main controller.  
- Config is split into `constants/gameConfig.data.js` and registered via `gameConfig.constant.js`.  
- Economy is in `services/economy.service.js` and used by the controller.  
- Tests exist for save/load and economy service.

---

## Phase 1: Clean, Usable State (No Behavior Change)

Goal: Same game behavior, but easier to work in and ready for Phase 2.

### 1.1 Split `index.html`

- **Extract tab/section markup** into small HTML partials (e.g. `town.html`, `hero.html`, `production.html`, `professions.html`, `bestiary.html`, `options.html`) and load them with `ng-include` or route templates so `index.html` is mostly layout and shell.
- **Extract inline `ng-template` scripts** (e.g. `showEquip.html`, `showBattle.html`) into separate files and reference by path or template ID.
- **Move the GA script** into a small JS module or build step so the HTML stays structure-only.
- **Keep one entry HTML** (e.g. `index.html`) that references the partials and the main bundle.

### 1.2 Move Libraries to npm

- **Add npm packages** for: `angular`, `angular-ui-bootstrap` (or `@uirouter/angular-ui-bootstrap` if needed), `jquery`, `jquery-ui`, `bootstrap` (JS + CSS), and angulartics (e.g. `angulartics`, `angulartics-google-analytics`).
- **Update `src/main.js`** (and any other entry points) to import from `node_modules` instead of `./lib/...`.
- **Remove vendored copies** from `src/lib/` (or keep only if some build step still needs them; ideally delete).
- **Adjust Vite config** so these dependencies are bundled correctly and the static-copy of libs can be dropped if everything comes from npm.
- **CSS**: Link Bootstrap/jQuery UI theme from node_modules or a single bundled CSS entry so `index.html` doesn’t depend on many hardcoded paths.

### 1.3 Split the Monolithic Controller

- **Identify logical domains** in `maincontroller.js`, e.g.:  
  - Save/Load, Tutorial/Panel  
  - Buildings, Blueprints, Upgrades  
  - Heroes (add/worker/class/profession), Party  
  - Dungeons, Monsters, Battles, Combat  
  - Production (potions, weapons, timers)  
  - UI (dialogs, errors, theme), Game loop / random events  
- **Extract services/factories** for:  
  - Save/load (and versioning),  
  - Combat/battle resolution,  
  - Dungeon/monster/boss creation,  
  - Hero creation and profession/class changes,  
  - Production (create potion/weapon, timers).  
- **Keep MainController as a thin orchestrator**: inject these services, expose only what the template needs (e.g. `$scope.buyUpgrade = SaveLoadService.buyUpgrade` or delegate to domain services), and move large blocks of logic into the new services.
- **Optionally split “view models”**: e.g. a dedicated “Hero list” or “Town” controller that gets a slice of shared state, if it simplifies templates without over-splitting.

### 1.4 General Project Cleanup

- **Consistent structure**: e.g. `src/controllers/`, `src/services/`, `src/constants/`, `src/directives/`, `src/filters/`, and optionally `src/components/` for directive-like pieces.
- **Naming**: Prefer one main file per feature (e.g. `saveLoad.service.js`, `combat.service.js`) and consistent suffixes (`.constant.js`, `.service.js`, `.controller.js`).
- **Remove or gate dead code**: e.g. `$scope.debugging`, `testing2()`, and any unused branches; keep a single “debug mode” if needed.
- **Lint/format**: Add a linter and formatter (e.g. ESLint + Prettier) and fix or exclude legacy files as needed.
- **Docs**: Keep this roadmap updated as Phase 1 tasks are completed; add a short README for “how to run and build” and “where things live.”

---

## Phase 2: Framework Migration (AngularJS → Modern Framework)

Goal: Replace AngularJS with a supported framework (Angular, React, Vue, or Svelte) without changing game behavior.

- **After Phase 1**, the app should have:  
  - Small, domain-focused services (save/load, combat, production, etc.),  
  - Clear data flow and minimal “god” controller,  
  - HTML in small partials and templates.

- **Migration approach (high level):**  
  1. **Choose framework** (Angular / React / Vue / Svelte) based on team and long-term maintenance.  
  2. **Reuse Phase 1 services** where possible: keep game logic in plain JS services; the new app only replaces the view layer and the “orchestrator” (controller → components + hooks).  
  3. **Replace UI piece by piece** (e.g. tab by tab): one route or component at a time, calling the same services and state, with a shared state store (e.g. simple reactive store or framework state) if needed.  
  4. **Replace Angular-specific pieces**: directives → framework components; filters → pipes or helper functions; `$scope`/two-way binding → component state + events or one-way binding.  
  5. **Remove AngularJS and old dependencies** once all views and behaviors are reimplemented.

Phase 2 can be broken into a separate, more detailed plan (e.g. component map, state design, and migration order) once Phase 1 is done and the framework is chosen.

---

## Suggested Phase 1 Order

1. **Libraries to npm** (1.2) – unblocks cleaner builds and removes vendored files. **Done:** jQuery, jQuery UI, Bootstrap, Angular 1.8, angular-animate, angular-ui-bootstrap, angulartics, angulartics-google-analytics are now npm dependencies; load order is enforced in `src/vendor/jquery-global.js` and `src/main.js`; `src/lib/` is no longer used by the bundle (can be removed after you confirm the app in browser). **Setup:** Use Node 18+ (see `.nvmrc` for 20). Run `npm install` (`.npmrc` uses `legacy-peer-deps=true` for angulartics peer deps). Then `npm run dev` or `npm run build` + `npm run preview`.  
2. **Split index.html** (1.1) – smaller files and clearer structure for later migration.  
3. **Split maincontroller** (1.3) – extract services first, then thin the controller.  
4. **Cleanup** (1.4) – structure, naming, lint, docs.

You can do 1.1 and 1.3 in parallel to some extent (e.g. extract one service and one HTML partial at a time) to keep the app running and testable after each step.
