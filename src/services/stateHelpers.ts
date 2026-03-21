/**
 * stateHelpers: utilities for services to read and write Redux state.
 *
 * Replaces the old GameStateService + storeSync pattern:
 *  - getFlatState(store)          → returns a mutable clone of the full flat state
 *  - dispatchHeroes(store, flat)  → replaces heroes slice from flat state
 *  - dispatchBuildings(store, f)  → replaces buildings slice
 *  - dispatchDungeons(store, f)   → replaces dungeons slice
 *  - dispatchProduction(store, f) → replaces production slice
 *  - dispatchJobs(store, f)       → replaces jobs slice
 *  - dispatchUpgrades(store, f)   → replaces upgrades slice
 *  - dispatchUi(store, f)         → replaces ui slice
 *  - dispatchConfig(store, f)     → replaces config slice
 *  - dispatchGameStats(store, f)  → replaces gameStats slice
 *  - dispatchAll(store, f)        → dispatches all non-economy slices
 *
 * Economy is managed exclusively by EconomyService (dispatches setResources, setGold, etc.)
 * Tutorial is managed exclusively by tutorialSlice (advanceTutorial, skipTutorial).
 */
import { selectFullState } from '../store/index.ts';
import { replaceHeroes } from '../store/slices/heroesSlice.ts';
import { replaceBuildings } from '../store/slices/buildingsSlice.ts';
import { replaceDungeons } from '../store/slices/dungeonsSlice.ts';
import { replaceProduction } from '../store/slices/productionSlice.ts';
import { replaceJobs } from '../store/slices/jobsSlice.ts';
import { replaceUpgrades } from '../store/slices/upgradesSlice.ts';
import { replaceUi } from '../store/slices/uiSlice.ts';
import { replaceConfig } from '../store/slices/configSlice.ts';
import { replaceGameStats } from '../store/slices/gameStatsSlice.ts';
import type { AppStore } from '../store/index.ts';
import type { FlatGameState } from '../types/index.ts';

/** Returns a mutable deep clone of the current full flat game state. */
export function getFlatState(store: AppStore): FlatGameState {
  return structuredClone(selectFullState(store.getState()));
}

/** Dispatch the heroes slice (heroList, battles, journeys, party, bossBattle). */
export function dispatchHeroes(store: AppStore, flat: Partial<FlatGameState>): void {
  store.dispatch(
    replaceHeroes({
      // Clone heroList and battles so active combat/journey objects are not frozen by Immer
      heroList: structuredClone(flat.heroList ?? []),
      battles: structuredClone(flat.battles ?? []),
      journeys: flat.journeys ?? [],
      party: flat.party ?? [],
      bossBattle: flat.bossBattle ?? [],
    })
  );
}

/** Dispatch the buildings slice. */
export function dispatchBuildings(store: AppStore, flat: Partial<FlatGameState>): void {
  store.dispatch(replaceBuildings(flat.buildings ?? []));
}

/** Dispatch the dungeons slice (dungeons, monsters, bosses). */
export function dispatchDungeons(store: AppStore, flat: Partial<FlatGameState>): void {
  store.dispatch(
    replaceDungeons({
      dungeons: flat.dungeons ?? [],
      monsters: flat.monsters ?? [],
      bosses: flat.bosses ?? [],
    })
  );
}

/** Dispatch the production slice (potion, potions, weapons, blueprints). */
export function dispatchProduction(store: AppStore, flat: Partial<FlatGameState>): void {
  store.dispatch(
    replaceProduction({
      potion: flat.potion ?? ({} as FlatGameState['potion']),
      potions: flat.potions ?? [],
      weapons: flat.weapons ?? [],
      blueprints: flat.blueprints ?? [],
    })
  );
}

/** Dispatch the jobs slice. */
export function dispatchJobs(store: AppStore, flat: Partial<FlatGameState>): void {
  store.dispatch(replaceJobs(flat.jobs ?? []));
}

/** Dispatch the upgrades slice. */
export function dispatchUpgrades(store: AppStore, flat: Partial<FlatGameState>): void {
  store.dispatch(replaceUpgrades(flat.upgrades ?? []));
}

/** Dispatch the ui slice. */
export function dispatchUi(store: AppStore, flat: Partial<FlatGameState>): void {
  store.dispatch(
    replaceUi({
      panel: flat.panel,
      panelNumber: flat.panelNumber,
      showTutorial: flat.showTutorial,
      panelInfo: flat.panelInfo,
      sorting: flat.sorting,
      showHeroTable: flat.showHeroTable,
      heroTable: flat.heroTable,
      heroEnabled: flat.heroEnabled,
      prodEnabled: flat.prodEnabled,
      upgEnabled: flat.upgEnabled,
      beastEnabled: flat.beastEnabled,
      hFilterString: flat.hFilterString,
      heroCollapse: flat.heroCollapse,
      successCount: flat.successCount,
      lossCount: flat.lossCount,
      optionsSuccess: flat.optionsSuccess,
      optionsLoss: flat.optionsLoss,
      version: flat.version,
      bestiary: flat.bestiary,
      predicate: flat.predicate,
      selectedDungeon: flat.selectedDungeon,
    })
  );
}

/** Dispatch the config slice. */
export function dispatchConfig(store: AppStore, flat: Partial<FlatGameState>): void {
  store.dispatch(
    replaceConfig({
      gameLoop: flat.gameLoop,
      randomE: flat.randomE,
      randomEventTimer: flat.randomEventTimer,
      restAmount: flat.restAmount,
      heroName: flat.heroName,
      monsterList: flat.monsterList,
      dungeonNames: flat.dungeonNames,
      tempClass: flat.tempClass,
      tempHero: flat.tempHero,
      events: flat.events,
      heroClass: flat.heroClass,
    })
  );
}

/** Dispatch the gameStats slice. */
export function dispatchGameStats(store: AppStore, flat: Partial<FlatGameState>): void {
  if (flat.gameStats) store.dispatch(replaceGameStats(flat.gameStats));
}

/**
 * Dispatch all non-economy, non-tutorial slices from a flat state snapshot.
 * Use this for operations that touch multiple slices at once.
 * Economy is always managed by EconomyService (setResources/setGold etc.).
 * Tutorial is always managed by tutorialSlice (advanceTutorial/skipTutorial).
 */
export function dispatchAll(store: AppStore, flat: Partial<FlatGameState>): void {
  dispatchHeroes(store, flat);
  dispatchBuildings(store, flat);
  dispatchDungeons(store, flat);
  dispatchProduction(store, flat);
  dispatchJobs(store, flat);
  dispatchUpgrades(store, flat);
  dispatchUi(store, flat);
  dispatchConfig(store, flat);
  dispatchGameStats(store, flat);
}
