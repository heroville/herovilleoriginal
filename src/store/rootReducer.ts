/**
 * Root reducer: combines all slice reducers.
 * REPLACE_STATE is no longer used — services dispatch fine-grained slice actions directly.
 */
import { combineReducers } from '@reduxjs/toolkit';
import economyReducer from './slices/economySlice.ts';
import uiReducer from './slices/uiSlice.ts';
import tutorialReducer from './slices/tutorialSlice.ts';
import configReducer from './slices/configSlice.ts';
import buildingsReducer from './slices/buildingsSlice.ts';
import heroesReducer from './slices/heroesSlice.ts';
import dungeonsReducer from './slices/dungeonsSlice.ts';
import productionReducer from './slices/productionSlice.ts';
import jobsReducer from './slices/jobsSlice.ts';
import upgradesReducer from './slices/upgradesSlice.ts';
import gameStatsReducer from './slices/gameStatsSlice.ts';

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
