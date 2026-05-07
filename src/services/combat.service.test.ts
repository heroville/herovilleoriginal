/**
 * Unit tests for CombatService with Redux store (store passed to constructor).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.ts';
import CombatServiceFactory from './combat.service.ts';
import type { GameUiServiceInstance } from './gameUi.service.ts';
import type { GameConfig, FlatGameState, Hero, Monster } from '../types/index.ts';

describe('CombatService with store', () => {
  it('startFight adds battle to store', () => {
    const hero = {
      id: 1,
      name: 'TestHero',
      currHealth: 100,
      health: 100,
      level: 1,
      equip: {
        weapon: { id: 0, broken: false, minDamage: 1, maxDamage: 2, durability: 10 },
        potions: [
          { id: 0, name: 'Regen', count: 0, active: false },
          { id: 1, name: 'Power', count: 0, active: false },
          { id: 2, name: 'Health', count: 0, active: false },
          { id: 3, name: 'GoodHealth', count: 0, active: false },
          { id: 4, name: 'GreatHealth', count: 0, active: false },
        ],
        gold: 0,
        scrap: 0,
      },
      location: 'Home',
      progress: 'Idle',
      dungeon: 0,
      clearCount: 0,
      experience: 0,
      next: 50,
      academy: { id: 0, name: 'Gatherer' },
      working: false,
      job: { id: 0, name: 'Idle', current: 0, limit: 100 },
      party: false,
    } as unknown as Hero;
    const state = {
      battles: [],
      heroList: [hero],
      weapons: [{ id: 0, name: 'Fist', count: 0, working: 0, maxCount: 1, cost: 0, enabled: true, minDamage: 1, maxDamage: 2, durability: 10 }],
      potions: [{ value: 20 }],
      damageMulti: 1,
      successCount: { amount: 3 },
      lossCount: { amount: 1 },
      buildings: [{ id: 0, name: 'Tent', count: 0, cost: 0, multiplier: 1, enabled: true, tier: 0 }],
      dungeons: [],
      gameStats: { wins: 0, losses: 0, battles: 0, weaponsAuto: 0, weaponsManual: [], buffs: 0, clicks: 0 },
    } as unknown as Partial<FlatGameState>;
    const HeroService = { heal: () => {}, gainExp: () => {} };
    const DungeonService = { travel: () => {} };
    const GameUiService = { showError: () => {} } as unknown as GameUiServiceInstance;
    const GameConfig = { heroClasses: [] } as unknown as GameConfig;
    const $timeout = () => {}; // don't recurse takeTurn so battle stays in state

    const store = createGameStore(state);
    const EconomyService = { incResources: () => 0, decResources: () => true, incGold: () => 0, decGold: () => true, incrRes: () => {} };
    const CombatService = CombatServiceFactory(
      store,
      HeroService,
      DungeonService,
      GameUiService,
      GameConfig,
      $timeout,
      EconomyService
    );

    const monList = [{ id: 0, name: 'Goblin', health: 1000, minDamage: 1, maxDamage: 1, value: 1, high: undefined, low: undefined }] as Monster[];
    const journey = { hero: [hero], dungeon: { id: 0, name: 'Test', steps: 10, level: 1, encounterRate: 10, encounterLevel: 1, reward: 'Gold;g;1', bossID: 0 }, steps: 0 };

    CombatService.startFight(monList, journey, false);

    expect(store.getState().heroes.battles.length).toBe(1);
  });
});
