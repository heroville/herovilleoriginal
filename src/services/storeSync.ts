/**
 * storeSync: shared factory for the Redux store binding pattern used by all services.
 *
 * Each service calls createStoreBinding(getStateFn) once inside its factory.
 * bindStore(store) is called from storeSetup.js at startup.
 * syncStoreIfBound() dispatches REPLACE_STATE with a structuredClone of current state.
 *
 * Migration path to eliminate this module (Task 15 — full Redux redesign):
 * 1. For each service, replace direct GameStateService mutations with Redux Toolkit
 *    slice actions (e.g. heroesSlice.addHero, buildingsSlice.upgradeBuilding)
 * 2. Have services receive `store` as a constructor arg, read via store.getState(),
 *    and write via store.dispatch(sliceAction(...))
 * 3. Once all services dispatch fine-grained actions, remove REPLACE_STATE,
 *    this module, and GameStateService entirely
 * 4. EconomyService is already partially migrated (dispatches setResources/setGold)
 *    and is the template for the full migration
 */
import { REPLACE_STATE } from '../store/sliceState.js';

interface StoreBinding {
  bindStore: (store: { dispatch: (action: { type: string; payload: unknown }) => void }) => void;
  syncStoreIfBound: () => void;
}

/**
 * Creates a Redux store binding for a service.
 * @param getState - function that returns the current flat game state to snapshot
 */
export function createStoreBinding(getState: () => object): StoreBinding {
  let _dispatch: ((action: { type: string; payload: unknown }) => void) | null = null;

  function bindStore(store: { dispatch: (action: { type: string; payload: unknown }) => void }) {
    if (store) _dispatch = store.dispatch;
  }

  function syncStoreIfBound() {
    if (_dispatch) {
      _dispatch({ type: REPLACE_STATE, payload: structuredClone(getState()) });
    }
  }

  return { bindStore, syncStoreIfBound };
}
