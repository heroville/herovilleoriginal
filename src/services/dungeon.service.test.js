/**
 * Unit tests for DungeonService with Redux store (bindStore, REPLACE_STATE after activateDungeon).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.js';
import DungeonServiceFactory from './dungeon.service.js';

describe('DungeonService with store', () => {
  it('bindStore + activateDungeon dispatches REPLACE_STATE and store dungeons update', () => {
    const state = {
      dungeons: [],
      monsters: [],
      bosses: [],
      dungeonNames: { dungeons: ['Cave', 'Forest'] },
      monsterList: { monsters: [{ name: 'Goblin' }, { name: 'Orc' }, { name: 'Dragon' }] },
      gameLoop: 1000
    };
    const GameStateService = { getState: () => state };
    const $timeout = (fn) => fn();
    const $injector = { get: () => ({ startFight: () => {} }) };

    const store = createGameStore(state);
    const DungeonService = DungeonServiceFactory(GameStateService, $timeout, $injector);
    DungeonService.bindStore(store);

    DungeonService.activateDungeon();

    expect(state.dungeons.length).toBe(1);
    expect(state.dungeons[0].name).toBeDefined();
    expect(store.getState().dungeons.dungeons.length).toBe(1);
  });
});
