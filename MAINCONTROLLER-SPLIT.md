# MainController Split Plan (Phase 1.3)

This document defines **small, testable phases** for splitting `maincontroller.js` into services and a thin controller. After each phase you can run the app and the test suite to confirm nothing is broken.

---

## Strategy

- **One service per phase** – each phase is a single, reviewable change.
- **Controller stays the single “owner” of `$scope`** – services receive state (or `$scope`) and mutate it, or return values the controller assigns. No big refactor of data flow in one step.
- **Commit after each phase** – so you can review diffs and revert a single phase if needed.
- **Verify after each phase** – run `npm run test` and the **Manual verification checklist** below (or the slice that applies).

---

## Phase Order and Scope

| Phase | Service | What moves | New file | Verification |
|-------|---------|------------|----------|---------------|
| **1** | SaveLoadService | `reset`, `save`, `load`, `loadData` + version check | `src/services/saveLoad.service.js` | Unit test + Save/Load in browser |
| **2** | CombatService | `takeTurn`, `heroTurn`, `enemyTurn`, `heroDamage`, `enemyDamage`, `monstersAlive`, `activatePotions`, `clearPotions`, `addLoot`, `startFight` | `src/services/combat.service.js` | Unit tests (optional) + Run a battle |
| **3** | DungeonService | `createMonster`, `createBoss`, `activateDungeon`, `dungeonName` | `src/services/dungeon.service.js` | Unit tests (optional) + Activate dungeon, check list |
| **4** | HeroService | `addHero`, `addWorker`, `heroProfession`, `heroClassChange`, `confirmClass`, `newHeroName`, `gainExp`, `heal` | `src/services/hero.service.js` | Add hero, change class/job |
| **5** | ProductionService | `createPotion`, `createPotions`, `buyWeapon`, `buyUpgrade`, `activateBlueprint` | `src/services/production.service.js` | Create potion, buy weapon/upgrade |
| **6** | (Optional) UI / Tutorial | `nextTutorial`, `skipTut`, `startInfo`, `showError`, `changeTheme` | `src/services/ui.service.js` or keep in controller | Tutorial + theme + errors |

Phases 1–5 align with MODERNIZATION.md §1.3. Phase 6 can be done later or skipped.

---

## Per-Phase Implementation Pattern

For every phase:

1. **Create the service file** (e.g. `src/services/saveLoad.service.js`).
2. **Implement the API** – same behavior as current controller functions; take `$scope` (or a state object) and GameConfig/EconomyService as needed.
3. **Register the service** in `src/app.js` (or a small `src/services/index.js` that app imports) so MainController can inject it.
4. **In MainController** – replace the inlined logic with a call to the service; pass `$scope` (or the needed slice) so the service can read/write the same state.
5. **Run** `npm run test`.
6. **Run** `npm run test:e2e` (and/or `npm run dev` + manual checklist).
7. **Commit** (e.g. `git add -A && git commit -m "Phase 1.3.N: Extract XxxService"`).

---

## Phase 1: SaveLoadService (Start Here)

- **Extract:** `reset`, `save`, `load`, `loadData`. Version check stays in `load`; actual apply of saved data can live in the service (e.g. `applySaveData(scope, data)`).
- **Service API (example):**
  - `save(scope)` – builds save payload from scope, writes to `localStorage`, returns or shows message via scope.
  - `load(scope)` – reads from `localStorage`, checks version, calls `loadData(scope, data)` or equivalent.
  - `loadData(scope, data)` – applies `data` onto `scope` (same fields as current `loadData`).
  - `reset(scope)` – current reset logic; may call `showError` on scope.
- **Controller:** `$scope.save = () => SaveLoadService.save($scope);` and similarly for `load`, `loadData`, `reset`.
- **Tests:** Adapt `tests/saveLoad.test.js` to call the new SaveLoadService (with a mock scope object) so round-trip save/load is covered by the test suite. Add the test file to `tests/runAllTests.js` if you add a new test module.

---

## Phase 2: CombatService

- **Extract:** All battle resolution: `takeTurn`, `heroTurn`, `enemyTurn`, `heroDamage`, `enemyDamage`, `monstersAlive`, `activatePotions`, `clearPotions`, `addLoot`, `startFight`. These can take `(scope, battle, journey, …)` or the minimal state they need.
- **Controller:** Keeps `monsterFight`, `bossFight`, `travel`, `attemptDungeon` etc., but delegates the actual combat steps to CombatService (e.g. `CombatService.takeTurn($scope, battle, journey)`).
- **Verification:** Start a dungeon, send a hero, run a fight to completion; check win/loss, loot, and hero state.

---

## Phase 3: DungeonService

- **Extract:** `createMonster`, `createBoss`, `activateDungeon`, `dungeonName`. These depend on GameConfig and possibly `$http` for dungeon names.
- **Controller:** Calls e.g. `DungeonService.activateDungeon($scope)` so `$scope.dungeons` is updated by the service.
- **Verification:** Build a Dungeon, activate it; confirm new dungeon and monster/boss lists look correct.

---

## Phase 4: HeroService

- **Extract:** `addHero`, `addWorker`, `heroProfession`, `heroClassChange`, `confirmClass`, `newHeroName`, `gainExp`, `heal` (and any helpers they use).
- **Controller:** Delegates to HeroService with `$scope` (and temp hero/class state as needed).
- **Verification:** Add hero, add worker, change class and profession; confirm counts and hero properties.

---

## Phase 5: ProductionService

- **Extract:** `createPotion`, `createPotions`, `buyWeapon`, `buyUpgrade`, `activateBlueprint`. Timers and progress can stay in controller initially or move into the service if they only touch production state.
- **Controller:** Delegates to ProductionService; scope still holds potions, weapons, upgrades, blueprints.
- **Verification:** Create a potion, buy a weapon, buy an upgrade, activate a blueprint.

---

## Manual Verification Checklist

Use this after each phase (or at least after 1, 2, and 5) to confirm the game still works. Run `npm run dev`, open the app in the browser, then:

| # | Action | Expected |
|---|--------|----------|
| 1 | Click to gain resources | Resources increase; cap respected |
| 2 | Buy first building (Tent) | Cost deducted; building count increases; dialogs/tutorial can advance |
| 3 | Save game (e.g. Options or hotkey) | “Game has saved” or equivalent |
| 4 | Refresh page | Game loads (or prompts load if version mismatch) |
| 5 | Load save | State matches (resources, gold, buildings, heroes) |
| 6 | Add a hero | Hero appears in list; can assign job/class |
| 7 | Send hero to dungeon / start journey | Journey starts; no console errors |
| 8 | Complete a battle (auto or manual) | Win/loss applied; loot/gold updated |
| 9 | Create potion / buy weapon / buy upgrade | Costs deducted; item/counts updated |
| 10 | Change theme (if applicable) | Theme toggles without errors |
| 11 | Skip / step through tutorial | Panels advance; no errors |

If any step fails, fix before moving to the next phase (or revert the last commit and adjust the extraction).

---

## Reviewing Changes

- **Per-phase diff:** After each phase, `git diff` (or your IDE diff) should show: one new service file, one (or two) registration/wiring changes, and edits in `maincontroller.js` that remove logic and add delegation.
- **Regression:** Running `npm run test` after every phase keeps existing behavior under test. Adding a small unit test for each new service (where practical) makes later refactors safer.

---

## Process improvements

### 1. E2E smoke tests (Playwright)

The repo includes a minimal Playwright setup:

- **Install (once):** `npm install` then `npx playwright install` (installs Chromium for test runs).
- **Run:** `npm run test:e2e` — builds the app, starts `vite preview`, and runs `e2e/smoke.spec.js` (app loads, Gather increases resources, Save shows confirmation).
- **Config:** `playwright.config.js` (webServer runs preview on port 4173; one Chromium project).
- **Add more tests:** add files under `e2e/` with `*.spec.js` and use `test()` / `expect()` from `@playwright/test`.

After each phase, run `npm run test:e2e` to reduce manual verification.

### 2. Agent strategy: one agent in order vs new agent per phase (see below)

**Recommendation:** Prefer **one agent working through the phases in order** so the “manual” checklist can be run automatically after each phase.

- **Playwright** is a good fit: one `npm install`, runs against your dev server or `npm run preview`, and can drive the same flows (click resources, buy building, save, reload, load, add hero, etc.). You get a small `e2e/` or `tests/e2e/` folder and a script (e.g. `npm run test:e2e`) that starts the server, runs the tests, then exits.
- **Scope:** Start with 3–5 critical flows that map to the checklist (e.g. “resources click → save → reload → load → state matches”, “add hero”, “start dungeon”). Add more as you do later phases. You don’t need to automate every checklist item on day one.
- **When to run:** After each phase: `npm run test` (unit) then `npm run test:e2e` (browser). If both pass, you can skip or shorten manual verification.
- **Lighter option:** If you want minimal setup, use the **cursor-ide-browser** MCP (or a single Playwright script that only does “open app, click until resources increase, then save and reload”) as a smoke test. That already reduces manual intervention.

### 3. Agent strategy: one agent in order vs new agent per phase

**Recommendation:** Prefer **one agent working through the phases in order** for this refactor.

- **Why:** The work is all against the **same file** (`maincontroller.js`) and the same pattern (extract → service → delegate). Context from Phase 1 (where things live, how `$scope` and services interact, EconomyService/SaveLoadService patterns) directly helps Phases 2–5. A new agent each time would have to re-read the controller and the plan.
- **When to start a new agent:** If the controller file or the plan gets too large to work with in one thread, or you switch to a different kind of task (e.g. “add Playwright” or “do Phase 1.4 cleanup”). Then a fresh agent with a narrow prompt (“Implement Phase 2 per MAINCONTROLLER-SPLIT.md; run unit and E2E tests”) is fine.
- **Context tips:** Keep MAINCONTROLLER-SPLIT.md and VERIFICATION-CHECKLIST.md as the single source of truth. Each phase prompt can be: “Continue with Phase N (XxxService) per MAINCONTROLLER-SPLIT.md; run tests and the checklist/E2E.”

### 3. Lessons from Phase 1 (SaveLoadService) to carry forward

- **Registration pattern:** New service = `src/services/<name>.service.js` (logic) + `src/controllers/<name>.service.js` (import + `app.factory(...)`). MainController injects the service and replaces inlined logic with one-line delegates. Reuse this for Combat, Dungeon, Hero, Production.
- **Scope vs dependencies:** Services that need `GameConfig` take it via Angular injection (factory argument). Services that need to call back into the UI (e.g. `showError`, `nextTutorial`) receive `scope` and call `scope.showError(...)`. Keep that pattern so the controller stays the single owner of `$scope`.
- **DOM and globals:** The controller should do any jQuery that touches the DOM (e.g. `$("#showOld").prop(...)`, `$("#loading").dialog("open")`) and pass only data into the service. That keeps services testable without a browser and avoids “shouldLoad is not defined”–style bugs from legacy globals.
- **Unit tests:** For each new service, add a small test (like `saveLoad.test.js`) that builds a mock scope, calls the service, and asserts on state. You don’t need full coverage; a single round-trip or key path per service is enough to catch regressions.
- **Edge cases:** Phase 1 showed that “Reset” and “version mismatch” need explicit handling in the service so the right modal (or none) is shown. For later phases, document similar edge cases (e.g. “what if hero list is empty when starting a fight?”) in the plan or in the service file so the next step doesn’t reintroduce bugs.

---

## Summary

- Implement **one phase at a time** (SaveLoad → Combat → Dungeon → Hero → Production).
- After each phase: **run tests**, **run the app** (or E2E), **do the checklist**, **commit**.
- Use **one agent in order** for Phases 2–5; add **Playwright (or similar) E2E** to automate the checklist and reduce manual runs.
- Reuse the **registration pattern**, **scope + injection pattern**, and **unit-test pattern** from Phase 1 for each new service.
