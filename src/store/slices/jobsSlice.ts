/**
 * Jobs slice: available jobs (Gather, Apothecary, Smith, etc.) with limits.
 * Updated by building unlocks (Tavern) and load.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { HeroJob } from '../../types/index.ts';

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: [] as HeroJob[],
  reducers: {
    replaceJobs(state, action: PayloadAction<HeroJob[]>) {
      return Array.isArray(action.payload) ? action.payload : state;
    },
  },
});

export const { replaceJobs } = jobsSlice.actions;
export default jobsSlice.reducer;
