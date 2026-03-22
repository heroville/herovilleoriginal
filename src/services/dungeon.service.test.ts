/**
 * Unit tests for DungeonService with Redux store (store passed to constructor).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.ts';
import DungeonServiceFactory from './dungeon.service.ts';

describe('DungeonService with store', () => {
  it('activateDungeon updates store dungeons', () => {
    const state = {
      dungeons: [],
      monsters: [],
      bosses: [],
      dungeonNames: { dungeons: ['Cave', 'Forest'] },
      monsterList: { monsters: [{ name: 'Goblin' }, { name: 'Orc' }, { name: 'Dragon' }] },
      gameLoop: 1000,
    };
    const $timeout = (fn: () => void) => fn();
    const $injector = { get: () => ({ startFight: () => {} }) };

    const store = createGameStore(state);
    const DungeonService = DungeonServiceFactory(store, $timeout, $injector);

    DungeonService.activateDungeon();

    expect(store.getState().dungeons.dungeons.length).toBe(1);
    expect(store.getState().dungeons.dungeons[0].name).toBeDefined();
  });
});
