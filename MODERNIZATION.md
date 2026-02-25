# Heroville Modernization Roadmap

This document describes the migration from AngularJS to **React**, keeping game logic in existing plain JS services and replacing only the view layer. Unit and E2E tests are added as we go; each migration step is verified by E2E before and after.

---

## Current State Summary

| Area | Current state |
|------|----------------|
| **HTML** | Shell `index.html` with layout and `ng-include`; tab/section partials in `public/partials/` (town, hero, production, professions, bestiary, options, dialogs); popover templates (showEquip, showBattle) as separate partials; GA in `src/analytics.js`. |
| **JS** | **MainController** (~380 lines) is a thin orchestrator: binds shared state, registers GameUiService, exposes only what templates need. **Domain services** in `src/services/`: SaveLoadService, GameStateService, GameUiService, DungeonService, CombatService, HeroService, ProductionService, BuildingService, EconomyService, UiService, UtilService. **Tab controllers**: BuildingController (town), HeroController (hero), ProductionController (production); they inherit scope from MainController and add tab-specific actions. |
| **Libraries** | From npm: jquery, jquery-ui-dist, bootstrap, angular, angular-animate, angular-ui-bootstrap, angulartics, angulartics-google-analytics. Load order in `src/vendor/jquery-global.js` and `src/main.js`. |
| **Styles** | Bootstrap, jQuery UI custom, `newStyle.css`, `darkStyle.css` in `public/styles/`. |
| **Build** | Vite with ng-annotate; entry is `src/main.js`. Run `npm run dev` or `npm run build` + `npm run preview`. Node 18+ (see `.nvmrc` for 20). |

**Architecture:**
- Single shared state via **GameStateService**; EconomyService binds to it.
- **GameUiService** holds the registered scope for UI callbacks (showError, nextTutorial, open dialogs); services use it instead of receiving scope.
- Game logic lives in plain JS services; the React app will replace only the view and orchestrator (controllers → components + hooks).

---

## Framework: React

Migration target is **React**. Game logic stays in `src/services/`; React components and hooks call these services. No framework-specific rewrite of domain logic.

---

## Testing Strategy

- **Regression:** Always run **E2E** for regression. Use `npm test` (builds then runs Playwright). E2E is the source of truth for “nothing broke.”
- **E2E (Playwright):** For each area we migrate, we **verify existing functionality with E2E first**, then **migrate the component**, then **rerun E2E** to confirm behavior is unchanged. Existing tests cover: load, gather, Town (Tent, hero dialog), Hero tab, Production, Options/save, combat flow.
- **Unit tests:** Legacy unit tests were removed; add or extend unit tests as part of migration when touching services. We do not block migration on full coverage.
- **Per-step flow:** (1) Add or run E2E for the area. (2) Implement the React component calling the same services. (3) Switch the app to use the new component for that area. (4) Rerun E2E. (5) Remove the old partial and any Angular-only code for that area.

---

## Pre-migration Refactors (Optional)

These reduce migration risk without changing behavior. Do them when convenient before or during the relevant step.

1. **Filters → plain functions** — Replace `heroBattle`, `heroWorker`, `heroAdventure` (and template `| filter:...`) with plain JS functions; call from controllers and expose results. React then calls the same functions.
2. **ngSlider** — Remove `$compile` usage: reimplement as a small component or static template + `setInterval` in the controller.
3. **$scope.$watch** — Replace the two MainController watchers (resources/gold → tutorial/panel) with explicit calls from the game loop or from the code that updates state.
4. **jQuery UI dialogs** — Replace with React modals when we migrate the tabs that use them.
5. **jQuery** — Migrate away from jQuery over the course of the React migration: replace jQuery UI dialogs with React modals when migrating each tab; replace remaining jQuery DOM usage (e.g. `#showOld` checkbox, button disabled, analytics click handlers) with vanilla JS or React. Remove `jquery` and `jquery-ui-dist` once no longer used (see Phase 2 step 4/5).

Avoid large structural refactors in the same change as the framework switch. Fix bugs in services when touching them; do not mix big game-design or balance changes with migration.

---

## Phase 2: Order of Work

1. **Pre-migration refactors (optional but recommended)**  
   Replace the three filters with plain functions; remove `$compile` for ngSlider; replace `$watch`-based tutorial/panel logic with explicit calls from the game loop or state-update code.

2. **Set up React** in the same repo (e.g. React entry alongside current one, or new app importing `src/services/`). Ensure the React shell can render one tab or route and call GameStateService and GameUiService.

3. **Migrate tab by tab.** For each tab: run/add E2E for existing behavior → implement React view → switch shell to new view → rerun E2E → remove old partial and Angular-only code.  
   **Order:** Town → Hero → Production → Professions → Bestiary → Options/Help → Dialogs and shared UI (header, resources, upgrades, random event).

4. **Replace remaining Angular pieces.** Move MainController responsibilities (game loop, save/load, random event, dialogs) into the React app’s root or layout and services. Remove AngularJS, angular-ui-bootstrap, ng-animate; replace any remaining jQuery UI dialogs with React modals. **jQuery migration:** Replace any remaining jQuery DOM usage (e.g. `#showOld`, button disabled, analytics) with vanilla JS or React; then remove `jquery` and `jquery-ui-dist` from dependencies.

5. **Cleanup.** Remove Angular entry points, ng-annotate, and dual-build complexity. Single app, single framework.

A **component map** (partial → React component, services used) and **state contract** (what the root/store exposes to tabs) can be added to this doc or `PHASE2-MIGRATION.md` as the migration progresses.
