/**
 * Unit tests for ProductionService with Redux store (store passed to constructor).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.ts';
import EconomyServiceFactory from './economy.service.ts';
import ProductionServiceFactory from './production.service.ts';
import type { GameUiServiceInstance } from './gameUi.service.ts';
import type { FlatGameState } from '../types/index.ts';

const stubUi = { register: () => {}, showError: () => {}, nextTutorial: () => {}, checkTutorialProgress: () => {}, openHeroDialog: () => {}, openWorkerDialog: () => {} } as unknown as GameUiServiceInstance;

describe('ProductionService with store', () => {
  it('create (potion) updates production in store', () => {
    const state = {
      resources: 100,
      maxResources: 200,
      potion: {
        id: -1,
        name: 'Herbs',
        count: 0,
        working: 0,
        maxCount: 5,
        cost: 10,
        prodTime: 0,
        progress: 'Create Potion',
        sellPrice: 1,
      },
      potions: [],
      panelNumber: 0,
      heroList: [],
      gameStats: { clicks: 0 },
    } as unknown as Partial<FlatGameState>;
    const store = createGameStore(state);
    const EconomyService = EconomyServiceFactory(stubUi, store);
    const ProductionService = ProductionServiceFactory(EconomyService, stubUi, store);

    const flat = { ...state } as unknown as FlatGameState;
    const createActions = {
      decResources: () => true,
      showError: () => {},
      nextTutorial: () => {},
      disablePotionButton: () => {},
      startCreatePotion: () => {},
      startCreatePotions: () => {},
    };

    ProductionService.create(flat, createActions, -1);

    expect((flat as unknown as { potion: { working: number } }).potion.working).toBe(1);
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
      potion: { id: -1, name: 'Herbs', count: 0, working: 0, maxCount: 5, cost: 10, prodTime: 0, progress: '', sellPrice: 1 },
      blueprints: [],
      gameLoop: 1000,
    } as unknown as Partial<FlatGameState>;
    const store = createGameStore(state);
    const EconomyService = EconomyServiceFactory(stubUi, store);
    const ProductionService = ProductionServiceFactory(EconomyService, stubUi, store);

    const flat = { ...state, weapons: [...(state as any).weapons.map((w: any) => ({ ...w }))], gameStats: { weaponsManual: {} } } as unknown as FlatGameState;
    const purchaseActions = {
      decResources: () => true as boolean,
      showError: () => {},
      nextTutorial: () => {},
      disableWeaponButton: () => {},
      startBuyWeapon: () => {},
    };

    ProductionService.purchaseWeapon(flat, purchaseActions, 0);

    expect((flat as any).weapons[0].working).toBe(1);
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
      potion: { id: -1, name: 'Herbs', count: 0, working: 0, maxCount: 5, cost: 10, prodTime: 0, progress: '', sellPrice: 1 },
      weapons: [],
      blueprints: [],
    } as unknown as Partial<FlatGameState>;
    const store = createGameStore(state);
    const EconomyService = EconomyServiceFactory(stubUi, store);
    const ProductionService = ProductionServiceFactory(EconomyService, stubUi, store);

    ProductionService.buyUpgrade(0);

    expect(store.getState().economy.incr).toBe(2);
    expect(store.getState().upgrades[0].enabled).toBe(false);
    expect(store.getState().upgrades[2].enabled).toBe(true);
  });
});
