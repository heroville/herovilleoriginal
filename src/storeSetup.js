/**
 * Store setup: creates the Redux store, binds all services, returns the store and a
 * syncStoreFromGameState() helper used by bootstrap and the api layer.
 */
import {
  EconomyService,
  SaveLoadService,
  HeroService,
  BuildingService,
  ProductionService,
  DungeonService,
  CombatService,
} from './container.js';
import { createGameStore, selectFullState, replaceStateFromFlat } from './store/index.js';

/**
 * @param {object} state - flat GameStateService state object (used as preload and for tutorial sync)
 * @returns {{ store: import('redux').Store, syncStoreFromGameState: Function }}
 */
export function setupStore(state) {
  const store = createGameStore(state);

  /** Keep GameStateService flat state in sync with Redux tutorial slice so save/load works. */
  store.subscribe(() => {
    const s = store.getState();
    if (s.tutorial) {
      state.tutorialStepIndex = s.tutorial.tutorialStepIndex;
      state.tutorialCompleted = s.tutorial.tutorialCompleted;
      state.gameLog = s.tutorial.gameLog || [];
    }
  });

  /** So EconomyService dispatches economy/gameStats actions; dual-writes keep GameStateService in sync. */
  EconomyService.bindStore(store, () => selectFullState(store.getState()));
  BuildingService.bindStore(store);
  HeroService.bindStore(store);
  ProductionService.bindStore(store);
  SaveLoadService.bindStore(store);
  DungeonService.bindStore(store);
  CombatService.bindStore(store);

  function syncStoreFromGameState() {
    replaceStateFromFlat(store, state);
  }

  return { store, syncStoreFromGameState };
}
