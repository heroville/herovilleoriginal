/**
 * Unit tests for HeroService with Redux store (store passed to constructor).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.js';
import HeroServiceFactory from './hero.service.js';

const mockGameConfig = {
  heroClasses: [
    { id: 0, name: 'Gatherer' },
    { id: 1, name: 'Apothecary' },
    { id: 2, name: 'Fighter' },
  ],
};

function makeState(overrides = {}) {
  const state = {
    resources: 10,
    gold: 0,
    buildings: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3, count: 1 },
      { id: 4 },
      { id: 5 },
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9 },
    ],
    jobs: [
      { id: 0, name: 'Gather', current: 0, limit: 100, enabled: true },
      { id: 1, name: 'Apothecary', current: 0, limit: 1, enabled: true },
      { id: 2, name: 'Smith', current: 0, limit: 1, enabled: true },
    ],
    heroClass: [{ id: 0 }, { id: 1 }, { id: 2 }],
    heroList: [],
    weapons: [{ id: 0, durability: 100, minDamage: 1, sellPrice: 0, count: 0 }],
    potions: [],
    potion: {},
    dungeons: [{ name: 'Home' }],
    tempClass: null,
    tempHero: null,
    ...overrides,
  };
  return state;
}

describe('HeroService with store', () => {
  it('addHero updates store heroList', () => {
    const state = makeState();
    const store = createGameStore(state);
    const noop = () => {};
    const HeroService = HeroServiceFactory(
      mockGameConfig,
      {},
      store,
      { showError: noop },
      {},
      {},
      {}
    );

    HeroService.addHero('TestHero');

    expect(store.getState().heroes.heroList).toHaveLength(1);
    expect(store.getState().heroes.heroList[0].name).toBe('TestHero');
  });

  it('addWorker updates store heroList', () => {
    const state = makeState();
    const store = createGameStore(state);
    const HeroService = HeroServiceFactory(mockGameConfig, {}, store, {}, {}, {}, {});

    HeroService.addWorker('WorkerOne');

    expect(store.getState().heroes.heroList).toHaveLength(1);
    expect(store.getState().heroes.heroList[0].name).toBe('WorkerOne');
  });

  it('heroProfession updates jobs and heroList in store', () => {
    const state = makeState();
    state.heroList = [
      { id: 0, name: 'H', job: state.jobs[0], progress: 'Idle', academy: state.heroClass[2] },
    ];
    const store = createGameStore(state);
    const HeroService = HeroServiceFactory(
      mockGameConfig,
      {},
      store,
      { showError: () => {} },
      {},
      {},
      {}
    );

    HeroService.heroProfession(1, 0);

    expect(store.getState().jobs[1].current).toBe(1);
    expect(store.getState().heroes.heroList[0].job.id).toBe(1);
  });
});
