/**
 * Root reducer: combines all slices and handles REPLACE_STATE to sync from flat state.
 * When REPLACE_STATE is dispatched with flat state, the entire store is replaced with stateToSlices(payload).
 */
import { combineReducers } from '@reduxjs/toolkit';
import { REPLACE_STATE, stateToSlices } from './sliceState.js';
import { getTutorialStepFromState, TUTORIAL_LAST_STEP_INDEX } from '../constants/tutorialSteps.js';
import economyReducer from './slices/economySlice.js';
import uiReducer from './slices/uiSlice.js';
import tutorialReducer from './slices/tutorialSlice.js';
import configReducer from './slices/configSlice.js';
import buildingsReducer from './slices/buildingsSlice.js';
import heroesReducer from './slices/heroesSlice.js';
import dungeonsReducer from './slices/dungeonsSlice.js';
import productionReducer from './slices/productionSlice.js';
import jobsReducer from './slices/jobsSlice.js';
import upgradesReducer from './slices/upgradesSlice.js';
import gameStatsReducer from './slices/gameStatsSlice.js';

const combinedReducer = combineReducers({
  economy: economyReducer,
  ui: uiReducer,
  tutorial: tutorialReducer,
  config: configReducer,
  buildings: buildingsReducer,
  heroes: heroesReducer,
  dungeons: dungeonsReducer,
  production: productionReducer,
  jobs: jobsReducer,
  upgrades: upgradesReducer,
  gameStats: gameStatsReducer,
});

/**
 * Root reducer. Handles REPLACE_STATE to sync store from flat state after service mutations.
 */
export default function rootReducer(state, action) {
  if (action.type === REPLACE_STATE && action.payload != null) {
    const next = stateToSlices(action.payload);
    // Preserve UI-only state (e.g. dark theme) not present in flat payload
    if (state?.ui?.dark !== undefined) next.ui.dark = state.ui.dark;
    // Preserve tutorial when payload has no tutorial fields (e.g. from GameStateService)
    const payload = action.payload;
    if (payload.tutorialStepIndex === undefined && payload.tutorialCompleted === undefined) {
      next.tutorial = state?.tutorial ?? next.tutorial;
    }
    // Sync tutorial step from game state so we skip ahead if player is ahead (or load has progress)
    if (next.tutorial && !next.tutorial.tutorialCompleted) {
      const fromState = getTutorialStepFromState(payload);
      const current = next.tutorial.tutorialStepIndex ?? 0;
      if (fromState > current) {
        next.tutorial = { ...next.tutorial, tutorialStepIndex: fromState };
        if (fromState >= TUTORIAL_LAST_STEP_INDEX)
          next.tutorial = { ...next.tutorial, tutorialCompleted: true };
      }
    }
    return next;
  }
  return combinedReducer(state, action);
}
