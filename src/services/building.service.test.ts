/**
 * Unit tests for BuildingService with Redux store (store passed to constructor).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.ts';
import BuildingServiceFactory from './building.service.ts';
import type { GameUiServiceInstance } from './gameUi.service.ts';
import type { FlatGameState } from '../types/index.ts';

type PartialState = Partial<FlatGameState>;

describe('BuildingService with store', () => {
  it('incrBuilding updates buildings in store', () => {
    const state: PartialState = {
      resources: 10,
      maxResources: 25,
      gold: 0,
      maxGold: 0,
      buildings: [
        { id: 0, name: 'Tent', count: 0, cost: 5, multiplier: 4, enabled: true },
        { id: 1, name: 'Stockpile', count: 0, cost: 0, multiplier: 1, enabled: false },
        { id: 2, name: 'Market', count: 0, cost: 0, multiplier: 1, enabled: false },
        { id: 3, name: 'Blacksmith', count: 0, cost: 0, multiplier: 1, enabled: false },
        { id: 4, name: 'Tavern', count: 0, cost: 0, multiplier: 1, enabled: false },
        { id: 5, name: 'Alchemist', count: 0, cost: 0, multiplier: 1, enabled: false },
        { id: 6, name: 'Dungeons', count: 1, cost: 0, multiplier: 1, enabled: false },
        { id: 7, name: 'Academy', count: 0, cost: 0, multiplier: 1, enabled: false },
        { id: 8, name: 'Other', count: 0, cost: 0, multiplier: 1, enabled: false },
        { id: 9, name: 'Other2', count: 0, cost: 0, multiplier: 1, enabled: false },
      ],
      jobs: [{ id: 0, name: 'Idle', current: 0, limit: 1 }, { id: 1, name: 'Alchemist', current: 0, limit: 1, enabled: false }, { id: 2, name: 'Blacksmith', current: 0, limit: 1, enabled: false }],
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
    } as unknown as GameUiServiceInstance;
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
    const state: PartialState = {
      resources: 100,
      maxResources: 25,
      gold: 0,
      maxGold: 0,
      buildings: [
        { id: 0, name: 'Tent', count: 0, cost: 5, multiplier: 4, enabled: true },
        { id: 1, name: 'Stockpile', count: 0, cost: 25, multiplier: 5, enabled: true },
        { id: 2, name: 'Market', count: 0, cost: 0, multiplier: 1, enabled: false },
        { id: 3, name: 'Blacksmith', count: 0, cost: 0, multiplier: 1, enabled: false },
        { id: 4, name: 'Tavern', count: 0, cost: 0, multiplier: 1, enabled: false },
        { id: 5, name: 'Alchemist', count: 0, cost: 0, multiplier: 1, enabled: false },
        { id: 6, name: 'Dungeons', count: 0, cost: 0, multiplier: 1, enabled: false },
        { id: 7, name: 'Academy', count: 0, cost: 0, multiplier: 1, enabled: false },
        { id: 8, name: 'Other', count: 0, cost: 0, multiplier: 1, enabled: false },
        { id: 9, name: 'Other2', count: 0, cost: 0, multiplier: 1, enabled: false },
      ],
      jobs: [{ id: 0, name: 'Idle', current: 0, limit: 1 }, { id: 1, name: 'Alchemist', current: 0, limit: 1, enabled: false }, { id: 2, name: 'Blacksmith', current: 0, limit: 1, enabled: false }],
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
    const GameUiService = { showError: () => {}, nextTutorial: () => {}, openHeroDialog: () => {}, openWorkerDialog: () => {} } as unknown as GameUiServiceInstance;
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
    const state: PartialState = {
      resources: 0,
      maxResources: 25,
      gold: 100,
      maxGold: 100,
      buildings: Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Building${i}`, count: 0, cost: 0, multiplier: 1, enabled: i === 2 })),
      jobs: [],
      upgrades: [],
      blueprints: [{ id: 0, name: 'Blacksmith', buildingID: 1, cost: 50, enabled: true }],
      weapons: [],
      potions: [],
      dungeons: [],
      panelNumber: 0,
      bestiary: false,
      beastEnabled: true,
    };
    const store = createGameStore(state);
    const BuildingService = BuildingServiceFactory(store, {} as unknown as GameUiServiceInstance, { activateDungeon: () => {}, createMonster: () => {} }, { activateBlueprint: () => {} });

    const { state: st, actions } = BuildingService.buildStateAndActions({
      decResources: () => true,
      decGold: () => true,
    });
    const blueprint = st.blueprints[0];

    BuildingService.incrBlueprint(st, actions, blueprint);

    expect(store.getState().production.blueprints[0].enabled).toBe(false);
  });
});
