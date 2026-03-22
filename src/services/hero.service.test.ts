/**
 * Unit tests for HeroService with Redux store (store passed to constructor).
 */
import { describe, it, expect } from 'vitest';
import { createGameStore } from '../store/index.ts';
import HeroServiceFactory from './hero.service.ts';
import type { GameConfig, FlatGameState, GameUiServiceType, EconomyServiceType } from '../types/index.ts';

const mockGameConfig: GameConfig = {
  heroClasses: [
    { id: 0, name: 'Gatherer' },
    { id: 1, name: 'Apothecary' },
    { id: 2, name: 'Fighter' },
  ],
};

function makeState(overrides = {}): Partial<FlatGameState> {
  return {
    resources: 10,
    gold: 0,
    buildings: Array.from({ length: 10 }, (_, i) => ({ id: i, name: `B${i}`, count: i === 3 ? 1 : 0, cost: 0, multiplier: 1, enabled: true })),
    jobs: [
      { id: 0, name: 'Gather', current: 0, limit: 100, enabled: true },
      { id: 1, name: 'Apothecary', current: 0, limit: 1, enabled: true },
      { id: 2, name: 'Smith', current: 0, limit: 1, enabled: true },
    ],
    heroClass: [{ id: 0, name: 'Gatherer' }, { id: 1, name: 'Apothecary' }, { id: 2, name: 'Fighter' }],
    heroList: [],
    weapons: [{ id: 0, name: 'Fist', durability: 100, minDamage: 1, maxDamage: 2, sellPrice: 0, count: 0, working: 0, maxCount: 1, cost: 0, enabled: true }],
    potions: [],
    potion: { id: -1, name: 'Herbs', count: 0, working: 0, maxCount: 5, cost: 10, prodTime: 5, progress: '', sellPrice: 1 },
    dungeons: [{ id: 0, name: 'Home', level: 1, enabled: true, encounterRate: 5 }],
    tempClass: null,
    tempHero: null,
    ...overrides,
  } as unknown as Partial<FlatGameState>;
}

const noop = () => {};
const stubUi = { showError: noop, nextTutorial: noop, checkTutorialProgress: noop, register: noop, openHeroDialog: noop, openWorkerDialog: noop } as unknown as GameUiServiceType;
const stubEconomy = { incResources: () => 0, decResources: () => true, incGold: () => 0, decGold: () => false, incrRes: noop } as EconomyServiceType;
const stubDungeon = { attemptDungeon: noop };
const stubProduction = { activateBlueprint: noop, createPotion: noop, createPotions: noop, buyWeapon: noop };
const stubUtil = { meetRequirements: () => false, greaterThan: () => () => false };

describe('HeroService with store', () => {
  it('addHero updates store heroList', () => {
    const state = makeState();
    const store = createGameStore(state);
    const HeroService = HeroServiceFactory(mockGameConfig, stubEconomy, store, stubUi, stubDungeon, stubProduction, stubUtil);

    HeroService.addHero('TestHero');

    expect(store.getState().heroes.heroList).toHaveLength(1);
    expect(store.getState().heroes.heroList[0].name).toBe('TestHero');
  });

  it('addWorker updates store heroList', () => {
    const state = makeState();
    const store = createGameStore(state);
    const HeroService = HeroServiceFactory(mockGameConfig, stubEconomy, store, stubUi, stubDungeon, stubProduction, stubUtil);

    HeroService.addWorker('WorkerOne');

    expect(store.getState().heroes.heroList).toHaveLength(1);
    expect(store.getState().heroes.heroList[0].name).toBe('WorkerOne');
  });

  it('heroProfession updates jobs and heroList in store', () => {
    const state = makeState({
      heroList: [
        { id: 0, name: 'H', job: { id: 0, name: 'Gather', current: 0, limit: 100, enabled: true }, progress: 'Idle',
          academy: { id: 2, name: 'Fighter' }, currHealth: 100, health: 100, level: 1, experience: 0, next: 50,
          equip: { weapon: { id: 0 }, potions: [], gold: 0, scrap: 0 }, location: 'Home', dungeon: 0, clearCount: 0, working: false, party: false },
      ],
    });
    const store = createGameStore(state);
    const HeroService = HeroServiceFactory(mockGameConfig, stubEconomy, store, stubUi, stubDungeon, stubProduction, stubUtil);

    HeroService.heroProfession(1, 0);

    expect(store.getState().jobs[1].current).toBe(1);
    expect(store.getState().heroes.heroList[0].job.id).toBe(1);
  });
});
