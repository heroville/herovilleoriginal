/**
 * Redux store: single source of truth for game state.
 * Hydrated from GameConfig initial state at bootstrap via container.js.
 * Services read via getFlatState(store) and dispatch fine-grained slice actions.
 */
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer.js';
import { stateToSlices, selectFullState } from './sliceState.js';

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
    preloadedState,
  });
}

export { selectFullState, stateToSlices };
