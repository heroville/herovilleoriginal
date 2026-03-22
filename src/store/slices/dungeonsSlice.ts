/**
 * Dungeons slice: dungeons, monsters, bosses.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DungeonsState } from '../../types/index.ts';

const initialState: DungeonsState = {
  dungeons: [],
  monsters: [],
  bosses: [],
};

const dungeonsSlice = createSlice({
  name: 'dungeons',
  initialState,
  reducers: {
    replaceDungeons(state, action: PayloadAction<Partial<DungeonsState>>) {
      if (action.payload && typeof action.payload === 'object') {
        return { ...initialState, ...action.payload };
      }
      return state;
    },
  },
});

export const { replaceDungeons } = dungeonsSlice.actions;
export default dungeonsSlice.reducer;
