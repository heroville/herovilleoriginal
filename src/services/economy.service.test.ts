/**
 * Unit tests for EconomyService with Redux store (store passed to constructor).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.ts';
import EconomyServiceFactory from './economy.service.ts';
import type { GameUiServiceInstance } from './gameUi.service.ts';
import type { FlatGameState } from '../types/index.ts';

describe('EconomyService with store', () => {
  it('incrRes dispatches setResources and incrementClicks', () => {
    const state = {
      resources: 0,
      maxResources: 25,
      gold: 0,
      maxGold: 100,
      incr: 1,
      gameStats: { clicks: 0, battles: 0, wins: 0, losses: 0, weaponsAuto: 0, weaponsManual: [], buffs: 0 },
    } as unknown as Partial<FlatGameState>;
    const store = createGameStore(state);
    const GameUiService = { checkTutorialProgress: () => {} } as unknown as GameUiServiceInstance;
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
    } as unknown as Partial<FlatGameState>;
    const store = createGameStore(state);
    const EconomyService = EconomyServiceFactory({} as unknown as GameUiServiceInstance, store);

    const result = EconomyService.decResources(4);

    expect(result).toBe(true);
    expect(store.getState().economy.resources).toBe(6);
  });

  it('decResources returns false when insufficient resources', () => {
    const state = { resources: 2, maxResources: 25, gold: 0, maxGold: 0 } as unknown as Partial<FlatGameState>;
    const store = createGameStore(state);
    const EconomyService = EconomyServiceFactory({} as unknown as GameUiServiceInstance, store);

    const result = EconomyService.decResources(5);

    expect(result).toBe(false);
    expect(store.getState().economy.resources).toBe(2);
  });
});
