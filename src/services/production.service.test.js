/**
 * Unit tests for ProductionService with Redux store (store passed to constructor).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.js';
import EconomyServiceFactory from './economy.service.js';
import ProductionServiceFactory from './production.service.js';

describe('ProductionService with store', () => {
  it('create (potion) updates production in store', () => {
    const state = {
      resources: 100,
      maxResources: 200,
      potion: {
        count: 0,
        working: 0,
        maxCount: 5,
        cost: 10,
        prodTime: 0,
        progress: 'Create Potion',
      },
      potions: [],
      panelNumber: 0,
      heroList: [],
      gameStats: { clicks: 0 },
    };
    const store = createGameStore(state);
    const EconomyService = EconomyServiceFactory({}, store);
    const GameUiService = { showError: () => {}, nextTutorial: () => {} };
    const ProductionService = ProductionServiceFactory(EconomyService, GameUiService, store);

    const flat = { ...state };
    const createActions = {
      decResources: () => true,
      showError: () => {},
      nextTutorial: () => {},
      disablePotionButton: () => {},
      startCreatePotion: () => {},
      startCreatePotions: () => {},
    };

    ProductionService.create(flat, createActions, -1);

    expect(flat.potion.working).toBe(1);
    expect(store.getState().production.potion.working).toBe(1);
  });

  it('purchaseWeapon updates weapons and gameStats in store', () => {
    const state = {
      resources: 50,
      maxResources: 100,
      weapons: [
        {
          id: 0,
          name: 'Sword',
          count: 0,
          working: 0,
          maxCount: 1,
          cost: 20,
          prodTime: 0,
          progress: '',
        },
      ],
      buildings: [{ tier: 0 }, { tier: 1 }],
      upgrades: [{ enabled: false }, { enabled: false }],
      gameStats: { weaponsManual: {} },
      panelNumber: 0,
      heroList: [],
      potions: [],
      potion: {},
      blueprints: [],
      gameLoop: 1000,
    };
    const store = createGameStore(state);
    const EconomyService = EconomyServiceFactory({}, store);
    const GameUiService = { showError: () => {}, nextTutorial: () => {} };
    const ProductionService = ProductionServiceFactory(EconomyService, GameUiService, store);

    const flat = { ...state, weapons: [...state.weapons.map(w => ({ ...w }))], gameStats: { weaponsManual: {} } };
    const purchaseActions = {
      decResources: () => {},
      showError: () => {},
      nextTutorial: () => {},
      disableWeaponButton: () => {},
      startBuyWeapon: () => {},
    };

    ProductionService.purchaseWeapon(flat, purchaseActions, 0);

    expect(flat.weapons[0].working).toBe(1);
    expect(store.getState().production.weapons[0].working).toBe(1);
    expect(store.getState().gameStats.weaponsManual[0]).toBe(1);
  });

  it('buyUpgrade updates incr in economy slice', () => {
    const state = {
      resources: 0,
      maxResources: 25,
      gold: 10,
      maxGold: 100,
      incr: 1,
      panelNumber: 0,
      buildings: [{ tier: 0, name: 'Tent' }],
      restAmount: 0,
      upgrades: [
        { id: 0, price: 1, enabled: true },
        { id: 1, price: 3, enabled: false },
        { id: 2, price: 5, enabled: false },
      ],
      gameStats: {},
      heroList: [],
      potions: [],
      potion: {},
      weapons: [],
      blueprints: [],
    };
    const store = createGameStore(state);
    const EconomyService = EconomyServiceFactory({}, store);
    const GameUiService = { showError: () => {}, nextTutorial: () => {} };
    const ProductionService = ProductionServiceFactory(EconomyService, GameUiService, store);

    ProductionService.buyUpgrade(0);

    expect(store.getState().economy.incr).toBe(2);
    expect(store.getState().upgrades[0].enabled).toBe(false);
    expect(store.getState().upgrades[2].enabled).toBe(true);
  });
});
