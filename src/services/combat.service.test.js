/**
 * Unit tests for CombatService with Redux store (store passed to constructor).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.js';
import CombatServiceFactory from './combat.service.js';

describe('CombatService with store', () => {
  it('startFight adds battle to store', () => {
    const hero = {
      id: 1,
      currHealth: 100,
      health: 100,
      level: 1,
      equip: {
        weapon: { id: 0, broken: false, minDamage: 1, maxDamage: 2, durability: 10 },
        potions: [
          { count: 0, active: false },
          { count: 0, active: false },
          { count: 0 },
          { count: 0 },
          { count: 0 },
        ],
      },
      location: 'Home',
      progress: 'Idle',
      dungeon: 0,
      clearCount: 0,
      experience: 0,
      next: 50,
      academy: null,
    };
    const state = {
      battles: [],
      heroList: [hero],
      weapons: [{ id: 0 }],
      potions: [{ value: 20 }],
      damageMulti: 1,
      successCount: { amount: 3 },
      lossCount: { amount: 1 },
      buildings: [{ tier: 0 }],
      dungeons: [],
      gameStats: { wins: 0, losses: 0 },
    };
    const HeroService = { heal: () => {}, gainExp: () => {} };
    const DungeonService = { travel: () => {} };
    const GameUiService = { showError: () => {} };
    const GameConfig = { heroClasses: [] };
    const $timeout = () => {}; // don't recurse takeTurn so battle stays in state

    const store = createGameStore(state);
    const CombatService = CombatServiceFactory(
      store,
      HeroService,
      DungeonService,
      GameUiService,
      GameConfig,
      $timeout
    );

    const monList = [{ health: 1000, minDamage: 1, maxDamage: 1, value: 1, high: null, low: null }];
    const journey = { hero: [hero], dungeon: { steps: 10, level: 1 }, steps: 0 };

    CombatService.startFight(monList, journey, false);

    expect(store.getState().heroes.battles.length).toBe(1);
  });
});
