/**
 * Upgrades slice: purchasable upgrades (Bonus Resources I, etc.) with price and enabled.
 * Updated by ProductionService.buyUpgrade and load.
 */
import { createSlice } from '@reduxjs/toolkit';

const upgradesSlice = createSlice({
  name: 'upgrades',
  initialState: [],
  reducers: {
    replaceUpgrades(state, action) {
      return Array.isArray(action.payload) ? action.payload : state;
    }
  }
});

export const { replaceUpgrades } = upgradesSlice.actions;
export default upgradesSlice.reducer;
