import { describe, it, expect } from 'vitest';
import { stateToSlices, selectFullState, REPLACE_STATE } from './sliceState.ts';
import type { FlatGameState, RootState } from '../types/index.ts';

describe('stateToSlices', () => {
  it('maps flat state to sliced shape', () => {
    const flat = { resources: 10, maxResources: 50, gold: 5, heroList: [{ id: 1, name: 'Hero1' }] } as unknown as Partial<FlatGameState>;
    const sliced = stateToSlices(flat);
    expect(sliced.economy!.resources).toBe(10);
    expect(sliced.economy!.maxResources).toBe(50);
    expect(sliced.heroes!.heroList[0].name).toBe('Hero1');
  });

  it('uses defaults for missing keys', () => {
    const sliced = stateToSlices({});
    expect(sliced.economy!.resources).toBe(0);
    expect(sliced.economy!.maxResources).toBe(25);
  });
});

describe('selectFullState', () => {
  it('merges sliced state back to flat', () => {
    const sliced = stateToSlices({ resources: 20, gold: 10, heroList: [{ id: 1 }] } as unknown as Partial<FlatGameState>);
    const flat = selectFullState(sliced as RootState);
    expect(flat.resources).toBe(20);
    expect(flat.gold).toBe(10);
    expect(flat.heroList).toHaveLength(1);
  });
});

describe('REPLACE_STATE', () => {
  it('is game/replaceState', () => {
    expect(REPLACE_STATE).toBe('game/replaceState');
  });
});
