# MainController Domain Inventory

This document inventories the responsibilities packed into `Controllers/maincontroller.js` and maps them to the refactor domains requested earlier. Each section highlights the shared state, the controller routines that manipulate it, and a proposed Angular service/factory that could encapsulate that slice of logic.

## Economy & Building Management

**Shared state**
- Core resource pools: `resources`, `maxResources`, `gold`, `maxGold`, `incr`, `restAmount`, production multipliers (`damageMulti`, `goldMulti`).
- Building progression: `buildings`, `blueprints`, `upgrades`, `jobs`, `weapons`, `potions`, tutorial gates (`heroEnabled`, `prodEnabled`, `upgEnabled`, etc.).

**Key routines currently on `$scope`**
- Resource & currency adjustments: `incrRes`, `incResources`, `decResources`, `incGold`, `decGold`, periodic `work`/`rest` gains.
- Building and upgrade purchasing: `incrBuilding`, `incrBlueprint`, `activateBlueprint`, `activateDungeon` (building-triggered unlock), upgrade gating inside `incrBuilding` and `gainExp`.
- Production crafting: `create`, `createPotion`, `createPotions`, `purchaseWeapon`, `buyWeapon`, production queues inside `work`.
- Progression side-effects: tutorial advances, job unlocks, blueprint enables that are triggered from building counts.

**Suggested service: `EconomyService`**
- Responsibilities: manage resource pools, enforce purchase requirements, advance buildings/blueprints/upgrades, coordinate production timers, expose calculated availability (e.g., `canAffordBuilding(building)`).
- Public API candidates: `gather(multi)`, `purchaseBuilding(buildingId)`, `purchaseBlueprint(blueprintId)`, `queueCraft(itemType, itemId, options)`, `adjustGold(delta)`, `adjustResources(delta)`, `unlockNextDungeonIfNeeded()`.
- Collaboration notes: should emit events/promises when unlock thresholds are crossed so hero/dungeon services can react without the controller hard-wiring cross-domain calls.

## Hero Lifecycle Management

**Shared state**
- Hero roster and metadata: `heroList`, `tempClass`, `tempHero`, job definitions (`jobs`), class data (`heroClass` via `GameConfig`).
- Hero progression counters: `successCount`, `lossCount`, `randomEventTimer`, `randomE`, `gameStats` entries tied to hero actions.

**Key routines currently on `$scope`**
- Roster creation & naming: `addHero`, `addWorker`, `newHeroName`, dialog flows that open on building unlock.
- Profession & class assignment: `heroProfession`, `heroClassChange`, `confirmClass`, tutorial gating for class/profession.
- Activity cycles: `rest`, `work`, `gainExp`, `heal` helper, potion activation/cleanup (`activatePotions`, `clearPotions`), gold spending during downtime.
- Inventory & equipment upkeep: `purchaseWeapon`, `buyWeapon`, weapon durability handling in `heroDamage`, potion crafting queue hooks.
- Random hero-centric events: `randomEvent` (buffs), `randomE` scheduling, hero stat multipliers applied in combat.

**Suggested service: `HeroRosterService`**
- Responsibilities: own hero list state, handle hiring/naming, profession/class transitions, leveling/experience gains, rest/work job loops, downtime purchasing behavior, interface to production queues.
- Public API candidates: `hireHero(options)`, `assignJob(heroId, jobId)`, `queueClassChange(heroId, classId)`, `processRestTick()`, `processWorkTick()`, `applyRandomEvent(eventType)`, `recordBattleOutcome(heroIds, result)`.
- Collaboration notes: should subscribe to economy events (resource availability, building unlocks) and emit signals for dungeon eligibility or UI updates.

## Dungeon & Battle Flow

**Shared state**
- Adventure data: `dungeons`, `monsters`, `bosses`, `journeys`, `battles`, `bossBattle`, party selections, encounter timers.
- Configuration helpers: `monsterList`, `dungeonNames`, `successCount`, `lossCount`, travel pacing (`gameLoop`).

**Key routines currently on `$scope`**
- Dungeon lifecycle: `activateDungeon`, `attemptDungeon`, `travel`, `journey` setup logic, dungeon selection watchers.
- Encounter generation: `createMonster`, `createBoss`, random encounter assembly inside `travel`, `monsterFight`, `bossFight`.
- Battle engine: `startFight`, `takeTurn`, `heroTurn`, `enemyTurn`, `heroDamage`, `monstersAlive`, `monsterFight` loops, loot distribution (`addLoot`), potion toggles (`activatePotions`, `clearPotions`).
- Outcome handling: success/failure bookkeeping inside `takeTurn`, dungeon advancement (`successCount`/`lossCount`), respawn penalties, tutorial cues.

**Suggested service: `DungeonService`**
- Responsibilities: maintain dungeon list, orchestrate travel and battle queues, generate encounters, resolve combat rounds, manage loot/XP distribution, enforce dungeon progression rules.
- Public API candidates: `unlockNextDungeon()`, `startJourney(heroIds, dungeonId)`, `processTravelTick(journeyId)`, `resolveBattleRound(battleId)`, `applyRandomEncounter(journeyId)`, `recordDungeonOutcome(journeyId, result)`.
- Collaboration notes: should request hero data via `HeroRosterService` (for stats, inventory) and rely on `EconomyService` for rewards/loot crediting.

## UI Notifications & Tutorial Flow

**Shared state**
- Tutorial panels/log: `panel`, `panelNumber`, `showTutorial`, `panelInfo`, `heroTable`, `bestiary`, etc.
- Dialog flags: `heroEnabled`, `prodEnabled`, `upgEnabled`, `beastEnabled`, toggles for UI components, modal visibility.
- Error/logging helpers: `showError`, `debugLog`, watchers on `resources` and `gold` that advance tutorials.

**Key routines currently on `$scope`**
- Tutorial narration: `nextTutorial`, `skipTut`, `startInfo`, watchers tied to tutorial milestones, `showTutorial` toggles.
- Dialog orchestration: direct jQuery UI initialization (`#dialog`, `#dialog2`, `#loading`, `#version`, `#confirm`), DOM manipulations like `$('#w' + id)` disabling, manual `document.getElementById` updates.
- Notifications: `showError`, `showVersion`, `debugLog`, random event slider injection (`randomEvent` timeout).

**Suggested service/directive suite: `NotificationService` + UI Components**
- Responsibilities: centralize tutorial state machine, surface toast/log messaging, abstract dialog lifecycle behind Angular directives/components, expose observables for UI binding.
- Public API candidates: `pushMessage(message, options)`, `advanceTutorial(stepId)`, `openDialog(dialogId, data)`, `togglePanel(panelName, flag)`, `emitRandomEvent(eventType)`.
- Component ideas: `hero-dialog`, `worker-dialog`, `loading-modal`, `version-modal`, `error-banner`, each replacing the jQuery UI bindings with Angular templates/controllers.

## Cross-Domain Touchpoints to untangle during refactor

- Building unlocks trigger hero and dungeon changes (e.g., `incrBuilding` enabling jobs, calling `activateDungeon` and `createMonster`). Services should communicate through events or a shared store instead of direct cross-calls.
- Random events manipulate combat and economy multipliers—centralize the timer scheduling so both hero ticks and dungeon loops consume updated pacing values.
- `work`/`rest` intervals currently rely on controller-owned timers. Moving them into services suggests wrapping `$interval` calls within those services and exposing start/stop hooks to the controller.
- UI updates still rely on raw DOM access; future directives should bind to service observables rather than reading controller state directly.

