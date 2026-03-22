/**
 * Game stats slice: combat stats (battles, wins, losses), production counts, clicks.
 * Updated by CombatService and EconomyService (clicks).
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { GameStats } from '../../types/index.ts';

const initialState: GameStats = {
  battles: 0,
  wins: 0,
  losses: 0,
  weaponsAuto: 0,
  weaponsManual: [],
  buffs: 0,
  clicks: 0,
};

const gameStatsSlice = createSlice({
  name: 'gameStats',
  initialState,
  reducers: {
    /** Increment clicks (e.g. gather button). */
    incrementClicks(state) {
      state.clicks = (state.clicks || 0) + 1;
    },
    replaceGameStats(state, action: PayloadAction<Partial<GameStats>>) {
      if (action.payload && typeof action.payload === 'object') {
        return { ...initialState, ...action.payload };
      }
      return state;
    },
  },
});

export const { incrementClicks, replaceGameStats } = gameStatsSlice.actions;
export default gameStatsSlice.reducer;
