/**
 * Production slice: potion, potions, weapons, blueprints.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ProductionState, PotionItem } from '../../types/index.ts';

const emptyPotion: PotionItem = {
  id: -1,
  name: '',
  count: 0,
  working: 0,
  maxCount: 0,
  cost: 0,
  prodTime: 0,
  progress: '',
  sellPrice: 0,
};

const initialState: ProductionState = {
  potion: emptyPotion,
  potions: [],
  weapons: [],
  blueprints: [],
};

const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    replaceProduction(state, action: PayloadAction<Partial<ProductionState>>) {
      if (action.payload && typeof action.payload === 'object') {
        return { ...initialState, ...action.payload };
      }
      return state;
    },
  },
});

export const { replaceProduction } = productionSlice.actions;
export default productionSlice.reducer;
