/**
 * Production slice: potion, potions, weapons, blueprints.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  potion: {},
  potions: [],
  weapons: [],
  blueprints: [],
};

const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    replaceProduction(state, action) {
      if (action.payload && typeof action.payload === 'object') {
        return { ...initialState, ...action.payload };
      }
      return state;
    },
  },
});

export const { replaceProduction } = productionSlice.actions;
export default productionSlice.reducer;
