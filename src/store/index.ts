/**
 * Redux store: single source of truth for game state.
 * Hydrated from GameConfig initial state at bootstrap via container.ts.
 * Services read via getFlatState(store) and dispatch fine-grained slice actions.
 */
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer.ts';
import { stateToSlices, selectFullState } from './sliceState.ts';
import type { FlatGameState } from '../types/index.ts';

/**
 * Creates the Redux store with optional preloaded flat state.
 */
export function createGameStore(preloadedFlatState?: Partial<FlatGameState>) {
  const preloadedState =
    preloadedFlatState != null
      ? stateToSlices(structuredClone(preloadedFlatState) as Partial<FlatGameState>)
      : undefined;
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof createGameStore>;
export type AppDispatch = AppStore['dispatch'];

export { selectFullState, stateToSlices };
