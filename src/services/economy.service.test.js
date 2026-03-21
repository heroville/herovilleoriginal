/**
 * Unit tests for EconomyService with Redux store (store passed to constructor).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.js';
import EconomyServiceFactory from './economy.service.js';

describe('EconomyService with store', () => {
  it('incrRes dispatches setResources and incrementClicks', () => {
    const state = {
      resources: 0,
      maxResources: 25,
      gold: 0,
      maxGold: 100,
      incr: 1,
      gameStats: { clicks: 0 },
    };
    const store = createGameStore(state);
    const GameUiService = { checkTutorialProgress: () => {} };
    const EconomyService = EconomyServiceFactory(GameUiService, store);

    EconomyService.incrRes(3);

    expect(store.getState().economy.resources).toBe(3);
    expect(store.getState().gameStats.clicks).toBe(1);
  });

  it('decResources dispatches and returns true on success', () => {
    const state = {
      resources: 10,
      maxResources: 25,
      gold: 0,
      maxGold: 100,
      gameStats: {},
    };
    const store = createGameStore(state);
    const EconomyService = EconomyServiceFactory({}, store);

    const result = EconomyService.decResources(4);

    expect(result).toBe(true);
    expect(store.getState().economy.resources).toBe(6);
  });

  it('decResources returns false when insufficient resources', () => {
    const state = { resources: 2, maxResources: 25, gold: 0, maxGold: 0, gameStats: {} };
    const store = createGameStore(state);
    const EconomyService = EconomyServiceFactory({}, store);

    const result = EconomyService.decResources(5);

    expect(result).toBe(false);
    expect(store.getState().economy.resources).toBe(2);
  });
});
