/**
 * Unit tests for SaveLoadService with Redux store (store passed to constructor).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.ts';
import SaveLoadServiceFactory from './saveLoad.service.ts';
import type { GameUiServiceInstance } from './gameUi.service.ts';
import type { FlatGameState, GameConfig } from '../types/index.ts';

describe('SaveLoadService with store', () => {
  it('loadData dispatches to store and returns true', () => {
    const state = {
      resources: 5,
      maxResources: 25,
      gold: 10,
      maxGold: 100,
      incr: 1,
      restAmount: 2,
      buildings: [
        { id: 0, cost: 5, count: 0, tier: 0, enabled: true },
        { id: 1, cost: 25, count: 0, tier: 0, enabled: false },
      ],
      blueprints: [{ enabled: false }],
      upgrades: [{ enabled: true }, { enabled: false }],
      jobs: [{ enabled: true }, { enabled: false }],
      heroList: [],
      weapons: [],
      potions: [],
      potion: { id: -1, name: 'Herbs', count: 0, working: 0, maxCount: 5, cost: 10, prodTime: 0, progress: '', sellPrice: 1 },
      dungeons: [],
      monsters: [],
      bosses: [],
      heroEnabled: true,
      prodEnabled: true,
      upgEnabled: true,
      heroTable: false,
      successCount: { amount: 3 },
      lossCount: { amount: 1 },
      party: [],
      gameStats: {},
      panelNumber: 0,
      showTutorial: true,
      panel: [],
      version: '1.3',
      bestiary: false,
    } as unknown as Partial<FlatGameState>;
    const GameConfig = { heroClasses: [] } as unknown as GameConfig;
    const GameUiService = { register: () => {}, showError: () => {}, nextTutorial: () => {}, checkTutorialProgress: () => {}, openHeroDialog: () => {}, openWorkerDialog: () => {} } as unknown as GameUiServiceInstance;

    const store = createGameStore(state);
    const SaveLoadService = SaveLoadServiceFactory(GameConfig, GameUiService, store);

    const savedData = {
      resources: 100,
      maxResources: 200,
      gold: 200,
      maxGold: 500,
      incr: 2,
      restAmount: 3,
      buildings: [
        { cost: 5, count: 1, tier: 0, enabled: true },
        { cost: 25, count: 0, tier: 0, enabled: false },
      ],
      blueprints: [{ enabled: true }],
      upgrades: [{ enabled: false }, { enabled: true }],
      jobs: [{ enabled: true }, { enabled: true }],
      heroList: [],
      weapons: [],
      potions: [],
      potion: { working: 0 },
      dungeons: [],
      monsters: [],
      bosses: [],
      heroTable: true,
      success: 5,
      losses: 2,
      party: [],
      gameStats: {},
    };

    const result = SaveLoadService.loadData(null, savedData);

    expect(result).toBe(true);
    expect(store.getState().economy.resources).toBe(100);
    expect(store.getState().economy.gold).toBe(200);
  });
});
