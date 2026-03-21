/**
 * Root reducer: combines all slice reducers.
 * REPLACE_STATE is no longer used — services dispatch fine-grained slice actions directly.
 */
import { combineReducers } from '@reduxjs/toolkit';
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

const rootReducer = combineReducers({
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

export default rootReducer;
