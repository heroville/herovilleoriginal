/**
 * Redux store: single source of truth for game state.
 * Hydrated from GameStateService.getState() at bootstrap; api.getState() returns selectFullState(store.getState()).
 * Services mutate GameStateService and sync via replaceStateFromFlat or REPLACE_STATE.
 */
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer.js';
import { stateToSlices, selectFullState, REPLACE_STATE } from './sliceState.js';

/**
 * Creates the Redux store with optional preloaded flat state (e.g. from GameStateService.getState()).
 * @param {Object} [preloadedFlatState] - Flat state object to hydrate the store
 * @returns {Object} Redux store
 */
export function createGameStore(preloadedFlatState) {
  const preloadedState =
    preloadedFlatState != null
      ? stateToSlices(JSON.parse(JSON.stringify(preloadedFlatState)))
      : undefined;
  return configureStore({
    reducer: rootReducer,
    preloadedState
  });
}

/**
 * Dispatches replaceState so the store is updated from the current flat state.
 * Call after any code that mutates GameStateService until all mutations use dispatch.
 * @param {Object} store - Redux store
 * @param {Object} flatState - Full flat state (e.g. GameStateService.getState())
 */
export function replaceStateFromFlat(store, flatState) {
  if (store && flatState) {
    store.dispatch({
      type: REPLACE_STATE,
      payload: JSON.parse(JSON.stringify(flatState))
    });
  }
}

export { selectFullState, stateToSlices, REPLACE_STATE };
