/**
 * Unit tests for gameStats slice (incrementClicks, replaceGameStats).
 */
import { describe, it, expect } from 'vitest';
import gameStatsReducer, { incrementClicks, replaceGameStats } from './gameStatsSlice.js';

const initialState = {
  battles: 0,
  wins: 0,
  losses: 0,
  weaponsAuto: 0,
  weaponsManual: [],
  buffs: 0,
  clicks: 0,
};

describe('gameStatsSlice', () => {
  it('incrementClicks increases clicks by 1', () => {
    let state = gameStatsReducer(initialState, incrementClicks());
    expect(state.clicks).toBe(1);
    state = gameStatsReducer(state, incrementClicks());
    expect(state.clicks).toBe(2);
  });

  it('replaceGameStats replaces with payload', () => {
    const state = gameStatsReducer(initialState, replaceGameStats({ wins: 5, losses: 2 }));
    expect(state.wins).toBe(5);
    expect(state.losses).toBe(2);
    expect(state.clicks).toBe(0);
  });
});
