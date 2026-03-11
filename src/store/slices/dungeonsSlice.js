/**
 * Dungeons slice: dungeons, monsters, bosses.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dungeons: [],
  monsters: [],
  bosses: []
};

const dungeonsSlice = createSlice({
  name: 'dungeons',
  initialState,
  reducers: {
    replaceDungeons(state, action) {
      if (action.payload && typeof action.payload === 'object') {
        return { ...initialState, ...action.payload };
      }
      return state;
    }
  }
});

export const { replaceDungeons } = dungeonsSlice.actions;
export default dungeonsSlice.reducer;
