/**
 * Unit tests for ProductionService with Redux store (bindStore, REPLACE_STATE after create, purchaseWeapon, buyUpgrade).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore, selectFullState } from '../store/index.js';
import ProductionServiceFactory from './production.service.js';

describe('ProductionService with store', () => {
  it('bindStore + create (potion) dispatches REPLACE_STATE and store production updates', () => {
    const state = {
      resources: 100,
      potion: { count: 0, working: 0, maxCount: 5, cost: 10, prodTime: 0, progress: 'Create Potion' },
      potions: [],
      panelNumber: 0,
      heroList: []
    };
    const EconomyService = { getState: () => state };
    const GameUiService = { showError: () => {}, nextTutorial: () => {} };

    const store = createGameStore(state);
    const ProductionService = ProductionServiceFactory(EconomyService, GameUiService);
    ProductionService.bindStore(store);

    const createState = {
      potion: state.potion,
      potions: state.potions,
      get resources() { return state.resources; },
      get panelNumber() { return state.panelNumber; }
    };
    const createActions = {
      decResources: () => true,
      showError: () => {},
      nextTutorial: () => {},
      disablePotionButton: () => {},
      startCreatePotion: () => {},
      startCreatePotions: () => {}
    };

    ProductionService.create(createState, createActions, -1);

    expect(state.potion.working).toBe(1);
    expect(store.getState().production.potion.working).toBe(1);
  });

  it('bindStore + purchaseWeapon dispatches REPLACE_STATE and store weapons/gameStats update', () => {
    const state = {
      resources: 50,
      weapons: [
        { id: 0, name: 'Sword', count: 0, working: 0, maxCount: 1, cost: 20, prodTime: 0, progress: '' }
      ],
      buildings: [{ tier: 0 }, { tier: 1 }],
      upgrades: [{ enabled: false }, { enabled: false }],
      gameStats: { weaponsManual: {} },
      panelNumber: 0
    };
    const EconomyService = { getState: () => state };
    const GameUiService = { showError: () => {}, nextTutorial: () => {} };

    const store = createGameStore(state);
    const ProductionService = ProductionServiceFactory(EconomyService, GameUiService);
    ProductionService.bindStore(store);

    const purchaseState = {
      weapons: state.weapons,
      get resources() { return state.resources; },
      buildings: state.buildings,
      upgrades: state.upgrades,
      gameStats: state.gameStats,
      get panelNumber() { return state.panelNumber; }
    };
    const purchaseActions = {
      decResources: () => {},
      showError: () => {},
      nextTutorial: () => {},
      disableWeaponButton: () => {},
      startBuyWeapon: () => {}
    };

    ProductionService.purchaseWeapon(purchaseState, purchaseActions, 0);

    expect(state.weapons[0].working).toBe(1);
    expect(store.getState().production.weapons[0].working).toBe(1);
    expect(store.getState().gameStats.weaponsManual[0]).toBe(1);
  });

  it('bindStore + buyUpgrade mutates state and dispatches REPLACE_STATE when store is bound', () => {
    const state = {
      resources: 0,
      gold: 10,
      incr: 1,
      panelNumber: 0,
      buildings: [{ tier: 0, name: 'Tent' }],
      restAmount: 0,
      upgrades: [
        { id: 0, price: 1, enabled: true },
        { id: 1, price: 3, enabled: false },
        { id: 2, price: 5, enabled: false }
      ]
    };
    const EconomyService = {
      getState: () => state,
      decGold: (n) => { state.gold -= n; }
    };
    const GameUiService = { showError: () => {}, nextTutorial: () => {} };

    const store = createGameStore(state);
    const ProductionService = ProductionServiceFactory(EconomyService, GameUiService);
    ProductionService.bindStore(store);

    ProductionService.buyUpgrade(0);

    expect(state.upgrades[0].enabled).toBe(false);
    expect(state.incr).toBe(2);
    expect(state.upgrades[2].enabled).toBe(true);
  });
});
