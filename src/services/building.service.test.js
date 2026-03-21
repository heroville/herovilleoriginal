/**
 * Unit tests for BuildingService with Redux store (store passed to constructor).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.js';
import BuildingServiceFactory from './building.service.js';

describe('BuildingService with store', () => {
  it('incrBuilding updates buildings in store', () => {
    const state = {
      resources: 10,
      maxResources: 25,
      gold: 0,
      maxGold: 0,
      buildings: [
        { id: 0, name: 'Tent', count: 0, cost: 5, multiplier: 4, enabled: true },
        { id: 1, name: 'Stockpile', count: 0, enabled: false },
        { id: 2, name: 'Market', count: 0, enabled: false },
        { id: 3, name: 'Blacksmith', count: 0, enabled: false },
        { id: 4, name: 'Tavern', count: 0, enabled: false },
        { id: 5, name: 'Alchemist', count: 0, enabled: false },
        { id: 6, name: 'Dungeons', count: 1, enabled: false },
        { id: 7, name: 'Academy', count: 0, enabled: false },
        { id: 8, name: 'Other', count: 0, enabled: false },
        { id: 9, name: 'Other2', count: 0, enabled: false },
      ],
      jobs: [{ id: 0 }, { id: 1, enabled: false }, { id: 2, enabled: false }],
      upgrades: [],
      blueprints: [],
      weapons: [],
      potions: [],
      dungeons: [],
      heroEnabled: true,
      prodEnabled: true,
      upgEnabled: true,
      panelNumber: 0,
      bestiary: false,
      beastEnabled: true,
    };
    const GameUiService = {
      showError: () => {},
      nextTutorial: () => {},
      openHeroDialog: () => {},
      openWorkerDialog: () => {},
    };
    const DungeonService = { activateDungeon: () => {}, createMonster: () => {} };
    const ProductionService = { activateBlueprint: () => {} };

    const store = createGameStore(state);
    const BuildingService = BuildingServiceFactory(store, GameUiService, DungeonService, ProductionService);

    const { state: st, actions } = BuildingService.buildStateAndActions({
      decResources: () => true,
      decGold: () => true,
    });
    const building = st.buildings[0];

    BuildingService.incrBuilding(st, actions, building);

    expect(store.getState().buildings[0].count).toBe(1);
  });

  it('incrBuilding Stockpile sets maxResources and maxGold in economy slice', () => {
    const state = {
      resources: 100,
      maxResources: 25,
      gold: 0,
      maxGold: 0,
      buildings: [
        { id: 0, name: 'Tent', count: 0, cost: 5, multiplier: 4, enabled: true },
        { id: 1, name: 'Stockpile', count: 0, cost: 25, multiplier: 5, enabled: true },
        { id: 2, name: 'Market', count: 0, enabled: false },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
        { id: 9 },
      ],
      jobs: [{ id: 0 }, { id: 1, enabled: false }, { id: 2, enabled: false }],
      upgrades: [],
      blueprints: [],
      weapons: [],
      potions: [],
      dungeons: [],
      heroEnabled: true,
      prodEnabled: true,
      upgEnabled: true,
      panelNumber: 0,
      bestiary: false,
      beastEnabled: true,
    };
    const GameUiService = { showError: () => {}, nextTutorial: () => {} };
    const DungeonService = { activateDungeon: () => {}, createMonster: () => {} };
    const ProductionService = { activateBlueprint: () => {} };

    const store = createGameStore(state);
    const BuildingService = BuildingServiceFactory(store, GameUiService, DungeonService, ProductionService);

    const { state: st, actions } = BuildingService.buildStateAndActions({
      decResources: () => true,
      decGold: () => true,
    });
    const building = st.buildings[1];

    BuildingService.incrBuilding(st, actions, building);

    // After first Stockpile upgrade: next cost = 25 + 2^5 = 57 → maxResources = 57 + 5 = 62, maxGold = 5
    expect(store.getState().economy.maxResources).toBe(62);
    expect(store.getState().economy.maxGold).toBe(5);
  });

  it('incrBlueprint updates blueprints in store', () => {
    const state = {
      resources: 0,
      maxResources: 25,
      gold: 100,
      maxGold: 100,
      buildings: [
        { id: 0 },
        { id: 1 },
        { id: 2, enabled: true },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
        { id: 9 },
      ],
      jobs: [],
      upgrades: [],
      blueprints: [{ id: 0, buildingID: 1, cost: 50, enabled: true }],
      weapons: [],
      potions: [],
      dungeons: [],
      panelNumber: 0,
      bestiary: false,
      beastEnabled: true,
    };
    const store = createGameStore(state);
    const BuildingService = BuildingServiceFactory(store, {}, {}, {});

    const { state: st, actions } = BuildingService.buildStateAndActions({
      decResources: () => true,
      decGold: () => true,
    });
    const blueprint = st.blueprints[0];

    BuildingService.incrBlueprint(st, actions, blueprint);

    expect(store.getState().production.blueprints[0].enabled).toBe(false);
  });
});
