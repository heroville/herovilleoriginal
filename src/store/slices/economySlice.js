/**
 * Economy slice: resources, gold, and related multipliers.
 * Updated by gather (incrRes), building costs, hero purchases, and random events.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  resources: 0,
  maxResources: 25,
  gold: 0,
  maxGold: 0,
  incr: 1,
  damageMulti: 1,
  goldMulti: 1
};

const economySlice = createSlice({
  name: 'economy',
  initialState,
  reducers: {
    /** Set resources (clamped to 0..maxResources). */
    setResources(state, action) {
      const v = Number(action.payload);
      if (!Number.isNaN(v)) state.resources = Math.max(0, Math.min(state.maxResources, v));
    },
    /** Set max resources (e.g. after Stockpile upgrade). */
    setMaxResources(state, action) {
      const v = Number(action.payload);
      if (!Number.isNaN(v) && v >= 0) state.maxResources = v;
    },
    /** Set gold (clamped to 0..maxGold). */
    setGold(state, action) {
      const v = Number(action.payload);
      if (!Number.isNaN(v)) state.gold = Math.max(0, Math.min(state.maxGold, v));
    },
    /** Set max gold capacity. */
    setMaxGold(state, action) {
      const v = Number(action.payload);
      if (!Number.isNaN(v) && v >= 0) state.maxGold = v;
    },
    /** Set resources per gather click. */
    setIncr(state, action) {
      const v = Number(action.payload);
      if (!Number.isNaN(v) && v >= 0) state.incr = v;
    },
    /** Set damage multiplier (e.g. random event). */
    setDamageMulti(state, action) {
      const v = Number(action.payload);
      if (!Number.isNaN(v) && v >= 0) state.damageMulti = v;
    },
    /** Set gold multiplier (e.g. random event). */
    setGoldMulti(state, action) {
      const v = Number(action.payload);
      if (!Number.isNaN(v) && v >= 0) state.goldMulti = v;
    },
    /** Replace entire economy state (e.g. from replaceState sync). */
    replaceEconomy(state, action) {
      if (action.payload && typeof action.payload === 'object') {
        return { ...initialState, ...action.payload };
      }
      return state;
    }
  }
});

export const {
  setResources,
  setMaxResources,
  setGold,
  setMaxGold,
  setIncr,
  setDamageMulti,
  setGoldMulti,
  replaceEconomy
} = economySlice.actions;

export default economySlice.reducer;
