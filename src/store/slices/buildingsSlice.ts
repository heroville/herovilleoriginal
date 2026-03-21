/** Buildings slice: building list (count, cost, enabled). */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Building } from '../../types/index.ts';

const buildingsSlice = createSlice({
  name: 'buildings',
  initialState: [] as Building[],
  reducers: {
    replaceBuildings(state, action: PayloadAction<Building[]>) {
      return Array.isArray(action.payload) ? action.payload : state;
    },
  },
});

export const { replaceBuildings } = buildingsSlice.actions;
export default buildingsSlice.reducer;
