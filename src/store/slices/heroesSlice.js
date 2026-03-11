/**
 * Heroes slice: heroList, battles, journeys, party, bossBattle.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  heroList: [],
  battles: [],
  journeys: [],
  party: [],
  bossBattle: []
};

const heroesSlice = createSlice({
  name: 'heroes',
  initialState,
  reducers: {
    replaceHeroes(state, action) {
      if (action.payload && typeof action.payload === 'object') {
        return { ...initialState, ...action.payload };
      }
      return state;
    }
  }
});

export const { replaceHeroes } = heroesSlice.actions;
export default heroesSlice.reducer;
