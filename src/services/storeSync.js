/**
 * storeSync: shared factory for the Redux store binding pattern used by all services.
 *
 * Each service calls createStoreBinding(getStateFn) once inside its factory.
 * bindStore(store) is called from storeSetup.js at startup.
 * syncStoreIfBound() dispatches REPLACE_STATE with a structuredClone of current state.
 */
import { REPLACE_STATE } from '../store/sliceState.js';

/**
 * @param {() => object} getState - function that returns the current flat game state
 * @returns {{ bindStore: (store: object) => void, syncStoreIfBound: () => void }}
 */
export function createStoreBinding(getState) {
  let _dispatch = null;

  function bindStore(store) {
    if (store) _dispatch = store.dispatch;
  }

  function syncStoreIfBound() {
    if (_dispatch) {
      _dispatch({ type: REPLACE_STATE, payload: structuredClone(getState()) });
    }
  }

  return { bindStore, syncStoreIfBound };
}
