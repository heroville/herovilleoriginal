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
6. **Run** `npm run dev` and go through the **Manual verification checklist** (full or the relevant slice).
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

## Summary

- Implement **one phase at a time** (SaveLoad → Combat → Dungeon → Hero → Production).
- After each phase: **run tests**, **run the app**, **do the checklist**, **commit**.
- This gives you small sections for testing and a clear way to review that changes are working after each update.
