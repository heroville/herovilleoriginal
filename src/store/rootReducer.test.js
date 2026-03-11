/**
 * Unit tests for root reducer: combined slices and REPLACE_STATE.
 */
import { describe, it, expect } from 'vitest';
import rootReducer from './rootReducer.js';
import { REPLACE_STATE, stateToSlices } from './sliceState.js';

describe('rootReducer', () => {
  it('returns combined initial state when no preload', () => {
    const state = rootReducer(undefined, { type: '@@init' });
    expect(state.economy).toBeDefined();
    expect(state.ui).toBeDefined();
    expect(state.config).toBeDefined();
    expect(state.buildings).toEqual([]);
    expect(state.heroes.heroList).toEqual([]);
  });

  it('REPLACE_STATE replaces entire state with stateToSlices(payload)', () => {
    const flat = {
      resources: 42,
      maxResources: 100,
      gold: 10,
      heroList: [{ id: 1, name: 'Test' }],
      panelNumber: 5
    };
    const state = rootReducer(undefined, { type: REPLACE_STATE, payload: flat });
    expect(state.economy.resources).toBe(42);
    expect(state.economy.maxResources).toBe(100);
    expect(state.economy.gold).toBe(10);
    expect(state.heroes.heroList).toHaveLength(1);
    expect(state.heroes.heroList[0].name).toBe('Test');
    expect(state.ui.panelNumber).toBe(5);
  });

  it('unknown action goes to combined reducer', () => {
    const initialState = rootReducer(undefined, { type: '@@init' });
    const state = rootReducer(initialState, {
      type: 'economy/setResources',
      payload: 15
    });
    expect(state.economy.resources).toBe(15);
  });
});
