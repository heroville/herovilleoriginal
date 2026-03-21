/** UI slice: tutorial panel, preferences, tab/display flags. */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  panel: [],
  panelNumber: 0,
  showTutorial: true,
  panelInfo: false,
  dark: false,
  sorting: {},
  showHeroTable: {},
  heroTable: false,
  heroEnabled: false,
  prodEnabled: false,
  upgEnabled: false,
  beastEnabled: false,
  hFilterString: {},
  heroCollapse: true,
  successCount: { amount: 3 },
  lossCount: { amount: 1 },
  optionsSuccess: [],
  optionsLoss: [],
  version: '2.0',
  bestiary: false,
  predicate: 'name',
  selectedDungeon: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    replaceUi(state, action) {
      if (action.payload && typeof action.payload === 'object') {
        return { ...initialState, ...action.payload };
      }
      return state;
    },
    toggleDark(state) {
      state.dark = !state.dark;
    },
  },
});

export const { replaceUi, toggleDark } = uiSlice.actions;
export default uiSlice.reducer;
