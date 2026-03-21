/**
 * Heroes slice: heroList, battles, journeys, party, bossBattle.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { HeroesState } from '../../types/index.ts';

const initialState: HeroesState = {
  heroList: [],
  battles: [],
  journeys: [],
  party: [],
  bossBattle: [],
};

const heroesSlice = createSlice({
  name: 'heroes',
  initialState,
  reducers: {
    replaceHeroes(state, action: PayloadAction<Partial<HeroesState>>) {
      if (action.payload && typeof action.payload === 'object') {
        return { ...initialState, ...action.payload };
      }
      return state;
    },
  },
});

export const { replaceHeroes } = heroesSlice.actions;
export default heroesSlice.reducer;
