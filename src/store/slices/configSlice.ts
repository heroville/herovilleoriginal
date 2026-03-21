/** Config slice: game loop, loaded config, random events, temp state. */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ConfigState } from '../../types/index.ts';

const initialState: ConfigState = {
  gameLoop: 1000,
  randomE: undefined,
  randomEventTimer: undefined,
  restAmount: 2,
  heroName: null,
  monsterList: null,
  dungeonNames: null,
  tempClass: null,
  tempHero: null,
  events: [],
  heroClass: [],
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    replaceConfig(state, action: PayloadAction<Partial<ConfigState>>) {
      if (action.payload && typeof action.payload === 'object') {
        return { ...initialState, ...action.payload };
      }
      return state;
    },
  },
});

export const { replaceConfig } = configSlice.actions;
export default configSlice.reducer;
