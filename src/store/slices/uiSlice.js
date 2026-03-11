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
  heroEnabled: true,
  prodEnabled: true,
  upgEnabled: true,
  beastEnabled: true,
  hFilterString: {},
  heroCollapse: true,
  successCount: { amount: 3 },
  lossCount: { amount: 1 },
  optionsSuccess: [],
  optionsLoss: [],
  version: '1.3',
  bestiary: false,
  predicate: 'name',
  selectedDungeon: 0
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
    }
  }
});

export const { replaceUi, toggleDark } = uiSlice.actions;
export default uiSlice.reducer;
