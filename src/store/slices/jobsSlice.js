/**
 * Jobs slice: available jobs (Gather, Apothecary, Smith, etc.) with limits.
 * Updated by building unlocks (Tavern) and load.
 */
import { createSlice } from '@reduxjs/toolkit';

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: [],
  reducers: {
    replaceJobs(state, action) {
      return Array.isArray(action.payload) ? action.payload : state;
    }
  }
});

export const { replaceJobs } = jobsSlice.actions;
export default jobsSlice.reducer;
