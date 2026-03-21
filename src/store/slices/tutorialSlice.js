/**
 * Tutorial state: step index, completed flag, game log.
 * Lives in Redux only; advanced via advanceTutorial / skipTutorial.
 * Game log is used after tutorial for showError-style messages.
 */
import { createSlice } from '@reduxjs/toolkit';
import { TUTORIAL_LAST_STEP_INDEX } from '../../constants/tutorialSteps.js';

const initialState = {
  tutorialStepIndex: 0,
  tutorialCompleted: false,
  gameLog: [],
};

const tutorialSlice = createSlice({
  name: 'tutorial',
  initialState,
  reducers: {
    advanceTutorial(state) {
      if (state.tutorialCompleted) return;
      state.tutorialStepIndex += 1;
      if (state.tutorialStepIndex >= TUTORIAL_LAST_STEP_INDEX) {
        state.tutorialCompleted = true;
      }
    },
    skipTutorial(state) {
      state.tutorialStepIndex = TUTORIAL_LAST_STEP_INDEX;
      state.tutorialCompleted = true;
    },
    setTutorialFromSave(state, action) {
      const { tutorialStepIndex, tutorialCompleted, gameLog } = action.payload ?? {};
      if (tutorialStepIndex !== undefined) state.tutorialStepIndex = tutorialStepIndex;
      if (tutorialCompleted !== undefined) state.tutorialCompleted = !!tutorialCompleted;
      if (Array.isArray(gameLog)) state.gameLog = gameLog;
    },
    addGameLogMessage: {
      prepare(message) {
        if (typeof message !== 'string') return { payload: { formatted: '' } };
        const timestamp = new Date().toTimeString().slice(0, 8);
        return { payload: { formatted: `${timestamp} : ${message}` } };
      },
      reducer(state, action) {
        const formatted = action.payload?.formatted;
        if (!formatted) return;
        state.gameLog.unshift(formatted);
        if (state.gameLog.length > 10) state.gameLog.pop();
      },
    },
  },
});

export const { advanceTutorial, skipTutorial, setTutorialFromSave, addGameLogMessage } =
  tutorialSlice.actions;
export default tutorialSlice.reducer;
