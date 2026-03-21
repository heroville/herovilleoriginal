/**
 * Unit tests for BuildingService with Redux store (bindStore, REPLACE_STATE after incrBuilding/incrBlueprint).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.js';
import BuildingServiceFactory from './building.service.js';

describe('BuildingService with store', () => {
  it('bindStore + incrBuilding dispatches REPLACE_STATE and store buildings update', () => {
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
    const GameStateService = { getState: () => state };
    const GameUiService = {
      showError: () => {},
      nextTutorial: () => {},
      openHeroDialog: () => {},
      openWorkerDialog: () => {},
    };
    const DungeonService = { activateDungeon: () => {}, createMonster: () => {} };
    const ProductionService = { activateBlueprint: () => {} };

    const store = createGameStore(state);
    const BuildingService = BuildingServiceFactory(
      GameStateService,
      GameUiService,
      DungeonService,
      ProductionService
    );
    BuildingService.bindStore(store);

    const { state: st, actions } = BuildingService.buildStateAndActions({
      decResources: () => true,
      decGold: () => true,
    });
    const building = st.buildings[0];

    BuildingService.incrBuilding(st, actions, building);

    expect(building.count).toBe(1);
    expect(store.getState().buildings[0].count).toBe(1);
  });

  it('incrBuilding Stockpile sets maxResources and maxGold from next upgrade cost so second upgrade is affordable', () => {
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
    const GameStateService = { getState: () => state };
    const GameUiService = { showError: () => {}, nextTutorial: () => {} };
    const DungeonService = { activateDungeon: () => {}, createMonster: () => {} };
    const ProductionService = { activateBlueprint: () => {} };

    const store = createGameStore(state);
    const BuildingService = BuildingServiceFactory(
      GameStateService,
      GameUiService,
      DungeonService,
      ProductionService
    );
    BuildingService.bindStore(store);

    const decResources = (amount) => {
      if (state.resources < amount) return false;
      state.resources -= amount;
      return true;
    };
    const { state: st, actions } = BuildingService.buildStateAndActions({
      decResources,
      decGold: () => true,
    });
    const building = st.buildings[1];

    BuildingService.incrBuilding(st, actions, building);

    // After first Stockpile upgrade: next cost = 25 + 2^5 = 57 → maxResources = 57 + 5 = 62, maxGold = 5
    const nextCost = 25 + Math.pow(2, 5);
    expect(state.maxResources).toBe(nextCost + Math.floor(nextCost / 10));
    expect(state.maxGold).toBe(Math.floor(nextCost / 10));
    expect(store.getState().economy.maxResources).toBe(62);
    expect(store.getState().economy.maxGold).toBe(5);
  });

  it('incrBlueprint dispatches REPLACE_STATE when store is bound', () => {
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
      blueprints: [{ buildingID: 1, cost: 50, enabled: true }],
      weapons: [],
      potions: [],
      dungeons: [],
      panelNumber: 0,
      bestiary: false,
      beastEnabled: true,
    };
    const GameStateService = { getState: () => state };
    const store = createGameStore(state);
    const BuildingService = BuildingServiceFactory(GameStateService, {}, {}, {});
    BuildingService.bindStore(store);

    const { state: st, actions } = BuildingService.buildStateAndActions({
      decResources: () => true,
      decGold: () => true,
    });
    const blueprint = st.blueprints[0];

    BuildingService.incrBlueprint(st, actions, blueprint);

    expect(blueprint.enabled).toBe(false);
    expect(store.getState().production.blueprints[0].enabled).toBe(false);
  });
});
