/** Buildings slice: building list (count, cost, enabled). */
import { createSlice } from '@reduxjs/toolkit';

const buildingsSlice = createSlice({
  name: 'buildings',
  initialState: [],
  reducers: {
    replaceBuildings(state, action) {
      return Array.isArray(action.payload) ? action.payload : state;
    }
  }
});

export const { replaceBuildings } = buildingsSlice.actions;
export default buildingsSlice.reducer;
