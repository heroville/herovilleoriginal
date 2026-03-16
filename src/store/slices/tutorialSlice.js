/**
 * Tutorial state: step index, completed flag, game log.
 * Lives in Redux only; advanced via advanceTutorial / skipTutorial.
 * Game log is used after tutorial for showError-style messages.
 */
import { createSlice } from '@reduxjs/toolkit';
import { TUTORIAL_TOTAL_STEPS, TUTORIAL_LAST_STEP_INDEX } from '../../constants/tutorialSteps.js';

const initialState = {
  tutorialStepIndex: 0,
  tutorialCompleted: false,
  gameLog: []
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
      state.tutorialStepIndex = TUTORIAL_TOTAL_STEPS;
      state.tutorialCompleted = true;
    },
    setTutorialFromSave(state, action) {
      const { tutorialStepIndex, tutorialCompleted, gameLog } = action.payload ?? {};
      if (tutorialStepIndex !== undefined) state.tutorialStepIndex = tutorialStepIndex;
      if (tutorialCompleted !== undefined) state.tutorialCompleted = !!tutorialCompleted;
      if (Array.isArray(gameLog)) state.gameLog = gameLog;
    },
    addGameLogMessage(state, action) {
      const msg = action.payload;
      if (typeof msg !== 'string') return;
      const timestamp = new Date().toTimeString().slice(0, 8);
      state.gameLog.unshift(`${timestamp} : ${msg}`);
      if (state.gameLog.length > 10) state.gameLog.pop();
    }
  }
});

export const { advanceTutorial, skipTutorial, setTutorialFromSave, addGameLogMessage } = tutorialSlice.actions;
export default tutorialSlice.reducer;
