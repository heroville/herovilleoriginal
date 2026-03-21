/**
 * Unit tests for SaveLoadService with Redux store (bindStore, REPLACE_STATE after loadData).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.js';
import SaveLoadServiceFactory from './saveLoad.service.js';

describe('SaveLoadService with store', () => {
  it('bindStore + loadData dispatches REPLACE_STATE and store updates', () => {
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
      potion: { working: 0 },
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
    };
    const scope = { state, skipTut: () => {}, nextTutorial: () => {}, showError: () => {} };
    const GameConfig = { heroClasses: [] };
    const GameUiService = { showError: () => {}, nextTutorial: () => {} };
    const GameStateService = { getState: () => state };

    const store = createGameStore(state);
    const SaveLoadService = SaveLoadServiceFactory(GameConfig, GameUiService, GameStateService);
    SaveLoadService.bindStore(store);

    const savedData = {
      resources: 100,
      maxResources: 50,
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
      panelNumber: 1,
      showTutorial: false,
    };

    const result = SaveLoadService.loadData(scope, savedData);

    expect(result).toBe(true);
    expect(state.resources).toBe(100);
    expect(state.gold).toBe(200);
    expect(store.getState().economy.resources).toBe(100);
    expect(store.getState().economy.gold).toBe(200);
    expect(store.getState().ui.panelNumber).toBe(0); // loadData sets panelNumber = data.panelNumber - 1
  });
});
