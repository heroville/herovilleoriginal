/**
 * Unit tests for economy slice reducers.
 */
import { describe, it, expect } from 'vitest';
import economyReducer, {
  setResources,
  setMaxResources,
  setGold,
  setMaxGold,
  setIncr,
  setDamageMulti,
  setGoldMulti,
  replaceEconomy,
} from './economySlice.js';

const initialState = {
  resources: 0,
  maxResources: 25,
  gold: 0,
  maxGold: 0,
  incr: 1,
  damageMulti: 1,
  goldMulti: 1,
};

describe('economySlice', () => {
  describe('setResources', () => {
    it('sets resources and clamps to 0..maxResources', () => {
      let state = economyReducer(initialState, setResources(10));
      expect(state.resources).toBe(10);
      state = economyReducer(state, setResources(100));
      expect(state.resources).toBe(25);
      state = economyReducer(state, setResources(-5));
      expect(state.resources).toBe(0);
    });

    it('ignores NaN', () => {
      const state = economyReducer({ ...initialState, resources: 5 }, setResources(NaN));
      expect(state.resources).toBe(5);
    });
  });

  describe('setMaxResources', () => {
    it('updates maxResources', () => {
      const state = economyReducer(initialState, setMaxResources(100));
      expect(state.maxResources).toBe(100);
    });
  });

  describe('setGold', () => {
    it('sets gold and clamps to 0..maxGold', () => {
      let state = economyReducer({ ...initialState, maxGold: 50 }, setGold(20));
      expect(state.gold).toBe(20);
      state = economyReducer(state, setGold(100));
      expect(state.gold).toBe(50);
      state = economyReducer(state, setGold(-1));
      expect(state.gold).toBe(0);
    });
  });

  describe('setMaxGold', () => {
    it('updates maxGold', () => {
      const state = economyReducer(initialState, setMaxGold(200));
      expect(state.maxGold).toBe(200);
    });
  });

  describe('setIncr', () => {
    it('updates incr', () => {
      const state = economyReducer(initialState, setIncr(3));
      expect(state.incr).toBe(3);
    });
  });

  describe('setDamageMulti / setGoldMulti', () => {
    it('updates multipliers', () => {
      let state = economyReducer(initialState, setDamageMulti(2));
      expect(state.damageMulti).toBe(2);
      state = economyReducer(state, setGoldMulti(1.5));
      expect(state.goldMulti).toBe(1.5);
    });
  });

  describe('replaceEconomy', () => {
    it('replaces economy state with payload', () => {
      const state = economyReducer(initialState, replaceEconomy({ resources: 99, gold: 50 }));
      expect(state.resources).toBe(99);
      expect(state.gold).toBe(50);
      expect(state.maxResources).toBe(25);
    });
  });
});
