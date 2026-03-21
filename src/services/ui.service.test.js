/**
 * Unit tests for UiService with Redux store (bindStore, REPLACE_STATE after nextTutorial).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.js';
import UiServiceFactory from './ui.service.js';

describe('UiService with store', () => {
  it('bindStore + nextTutorial dispatches REPLACE_STATE and store ui updates', () => {
    const state = {
      panel: ['Initial'],
      panelNumber: 0,
      showTutorial: true,
      panelInfo: false,
    };
    const scope = { state };
    const GameStateService = { getState: () => state };

    const store = createGameStore(state);
    const UiService = UiServiceFactory(GameStateService);
    UiService.bindStore(store);

    UiService.nextTutorial(scope);

    expect(state.panelNumber).toBe(1);
    expect(state.panel).toBeDefined();
    expect(store.getState().ui.panelNumber).toBe(1);
  });
});
