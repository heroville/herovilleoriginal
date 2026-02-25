# Heroville Modernization Roadmap

This document outlines the plan to bring Heroville to a clean, maintainable codebase and eventually to a modern framework. **Phase 1 is complete.**

---

## Current State Summary (Post–Phase 1)

| Area | Current state |
|------|----------------|
| **HTML** | Shell `index.html` with layout and `ng-include`; tab/section partials in `public/partials/` (town, hero, production, professions, bestiary, options, dialogs); popover templates (showEquip, showBattle) as separate partials; GA in `src/analytics.js`. |
| **JS** | **MainController** (~380 lines) is a thin orchestrator: binds shared state, registers GameUiService, exposes only what templates need. **Domain services** in `src/services/`: SaveLoadService, GameStateService, GameUiService, DungeonService, CombatService, HeroService, ProductionService, BuildingService, EconomyService, UiService, UtilService. **Tab controllers**: BuildingController (town), HeroController (hero), ProductionController (production); they inherit scope from MainController and add tab-specific actions. |
| **Libraries** | From npm: jquery, jquery-ui-dist, bootstrap, angular, angular-animate, angular-ui-bootstrap, angulartics, angulartics-google-analytics. Load order in `src/vendor/jquery-global.js` and `src/main.js`. |
| **Styles** | Bootstrap, jQuery UI custom, `newStyle.css`, `darkStyle.css` in `public/styles/` (or `styles/` as per layout). |
| **Build** | Vite with ng-annotate; entry is `src/main.js`. Run `npm run dev` or `npm run build` + `npm run preview`. Node 18+ (see `.nvmrc` for 20). |

**Architecture:**  
- Single shared state via **GameStateService**; EconomyService binds to it.  
- **GameUiService** holds the registered scope for UI callbacks (showError, nextTutorial, open dialogs); services use it instead of receiving scope.  
- No AppActions layer; combat/dungeon/hero/production/building logic lives in services and calls each other or GameUiService where needed.

---

## Phase 1: Completed

Phase 1 aimed at the same game behavior with a maintainable structure. All steps are done.

### 1.1 Split `index.html` — **Done**

- Tab/section markup in `public/partials/` (town, hero, production, professions, bestiary, options, dialogs).
- Inline `ng-template` scripts extracted to `partials/showEquip.html` and `partials/showBattle.html`.
- GA moved to `src/analytics.js`; single entry `index.html` is layout/shell only.

### 1.2 Move Libraries to npm — **Done**

- jQuery, jQuery UI, Bootstrap, Angular 1.8, angular-animate, angular-ui-bootstrap, angulartics, angulartics-google-analytics are npm dependencies.
- Load order enforced in `src/vendor/jquery-global.js` and `src/main.js`; `src/lib/` no longer used by the bundle.

### 1.3 Split the Monolithic Controller — **Done**

- Domain logic extracted into services: SaveLoad, GameState, GameUi, Dungeon, Combat, Hero, Production, Building, Economy, Ui, Util.
- MainController is a thin orchestrator; tab-specific controllers (Building, Hero, Production) own only their tab’s actions.
- Scope is used only for real UI needs; services use GameStateService and GameUiService instead of scope.

### 1.4 General Project Cleanup — **Done**

- Structure: `src/controllers/`, `src/services/`, `src/constants/`, etc.; one main file per feature with consistent suffixes.
- Dead code removed: `$scope.debugging`, `$scope.debugLog`, `$scope.testing`, `$scope.testing2`, and the debug-only UI button.
- Duplicate scope bindings removed (e.g. `heroProfession` only on HeroController; MainController no longer exposes service-only methods).
- ProductionController uses GameUiService for showError/nextTutorial instead of scope.
- This roadmap updated; see README for how to run and build.

---

## Phase 2: Framework Migration (AngularJS → Modern Framework)

Goal: Replace AngularJS with a supported framework (Angular, React, Vue, or Svelte) without changing game behavior.

- **Prerequisites (from Phase 1):**  
  - Small, domain-focused services (save/load, combat, production, etc.).  
  - Clear data flow and minimal orchestrator controller.  
  - HTML in small partials and templates.

- **Migration approach (high level):**  
  1. **Choose framework** (Angular / React / Vue / Svelte) based on team and long-term maintenance.  
  2. **Reuse Phase 1 services** where possible: keep game logic in plain JS services; the new app only replaces the view layer and the orchestrator (controller → components + hooks).  
  3. **Replace UI piece by piece** (e.g. tab by tab): one route or component at a time, calling the same services and state, with a shared state store if needed.  
  4. **Replace Angular-specific pieces**: directives → framework components; filters → pipes or helper functions; `$scope`/two-way binding → component state + events or one-way binding.  
  5. **Remove AngularJS and old dependencies** once all views and behaviors are reimplemented.

Phase 2 can be broken into a separate, more detailed plan (e.g. component map, state design, migration order) once the framework is chosen.
