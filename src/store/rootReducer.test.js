/**
 * Unit tests for root reducer: combined slices and action routing.
 */
import { describe, it, expect } from 'vitest';
import rootReducer from './rootReducer.js';

describe('rootReducer', () => {
  it('returns combined initial state when no preload', () => {
    const state = rootReducer(undefined, { type: '@@init' });
    expect(state.economy).toBeDefined();
    expect(state.ui).toBeDefined();
    expect(state.config).toBeDefined();
    expect(state.buildings).toEqual([]);
    expect(state.heroes.heroList).toEqual([]);
  });

  it('economy/setResources updates resources', () => {
    const initial = rootReducer(undefined, { type: '@@init' });
    const state = rootReducer(initial, { type: 'economy/setMaxResources', payload: 100 });
    const state2 = rootReducer(state, { type: 'economy/setResources', payload: 42 });
    expect(state2.economy.resources).toBe(42);
    expect(state2.economy.maxResources).toBe(100);
  });

  it('unknown action goes to combined reducer', () => {
    const initialState = rootReducer(undefined, { type: '@@init' });
    const state = rootReducer(initialState, {
      type: 'economy/setMaxResources',
      payload: 200,
    });
    const state2 = rootReducer(state, {
      type: 'economy/setResources',
      payload: 15,
    });
    expect(state2.economy.resources).toBe(15);
  });
});
