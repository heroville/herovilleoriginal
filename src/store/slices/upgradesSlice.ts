/**
 * Upgrades slice: purchasable upgrades (Bonus Resources I, etc.) with price and enabled.
 * Updated by ProductionService.buyUpgrade and load.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Upgrade } from '../../types/index.ts';

const upgradesSlice = createSlice({
  name: 'upgrades',
  initialState: [] as Upgrade[],
  reducers: {
    replaceUpgrades(state, action: PayloadAction<Upgrade[]>) {
      return Array.isArray(action.payload) ? action.payload : state;
    },
  },
});

export const { replaceUpgrades } = upgradesSlice.actions;
export default upgradesSlice.reducer;
