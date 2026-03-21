import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeroTab from './HeroTab.tsx';
import { renderWithProviders, makeGameApi } from '../test-utils.tsx';
import type { Hero, HeroJob } from '../types/index.ts';

const sampleHero: Hero = {
  id: 1,
  name: 'Aria',
  level: 3,
  health: 100,
  currHealth: 80,
  experience: 40,
  next: 75,
  location: 'Town',
  progress: 'Resting',
  equip: { gold: 5, scrap: 0, weapon: { id: 0, broken: false, minDamage: 1, maxDamage: 2, durability: 10, name: 'Fist', cost: 0, count: 0, working: 0, maxCount: 1, enabled: true, sellPrice: 0, heroClass: [] }, potions: [] },
  // academy.id 0 or 2 = adventure hero; id 1 = worker (see heroFilters.js)
  academy: { id: 0, name: 'Fighter' },
  job: { id: 0, name: 'Idle', current: 0, limit: 100, enabled: true } as unknown as HeroJob,
  dungeon: 0,
  clearCount: 0,
  working: false,
  party: false,
};

describe('HeroTab', () => {
  it('renders adventure hero in the hero list', () => {
    renderWithProviders(<HeroTab />, {
      stateOverrides: {
        heroList: [sampleHero],
        battles: [],
        jobs: [],
        sorting: { heroTable: 'name', heroWork: 'job.id' },
        hFilterString: {},
        showHeroTable: {},
      },
    });
    expect(screen.getByText(/Aria/)).toBeInTheDocument();
  });

  it('filters heroes by name when filter is active', () => {
    const hero2: Hero = { ...sampleHero, id: 2, name: 'Bob', academy: { id: 0, name: 'Fighter' } };
    renderWithProviders(<HeroTab />, {
      stateOverrides: {
        heroList: [sampleHero, hero2],
        battles: [],
        jobs: [],
        sorting: { heroTable: 'name', heroWork: 'job.id' },
        hFilterString: { name: 'Aria' },
        showHeroTable: {},
      },
    });
    expect(screen.getByText(/Aria/)).toBeInTheDocument();
    expect(screen.queryByText(/Bob/)).not.toBeInTheDocument();
  });

  it('toggles sort dropdown on Sort button click', async () => {
    renderWithProviders(<HeroTab />, {
      stateOverrides: {
        heroList: [],
        battles: [],
        jobs: [],
        sorting: { heroTable: 'name', heroWork: 'job.id' },
        hFilterString: {},
        showHeroTable: {},
      },
    });
    expect(screen.queryByRole('listbox', { name: /sort by/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /sort/i }));
    expect(screen.getByRole('listbox', { name: /sort by/i })).toBeInTheDocument();
  });

  it('calls game.hero.heroProfession when worker Change button clicked', async () => {
    const heroProfession = vi.fn();
    const worker: Hero = {
      ...sampleHero,
      id: 3,
      name: 'Carl',
      academy: { id: 1, name: 'Worker' },
      job: { id: 1, name: 'Farmer', current: 0, limit: 10, enabled: true } as unknown as HeroJob,
    };
    const api = makeGameApi({ hero: { heroProfession, heroClassChange: () => {} } });
    renderWithProviders(<HeroTab />, {
      gameApi: api,
      stateOverrides: {
        heroList: [worker],
        battles: [],
        jobs: [{ id: 1, name: 'Farmer', enabled: true, current: 0, limit: 10 } as unknown as import('../types/index.ts').HeroJob],
        sorting: { heroTable: 'name', heroWork: 'job.id' },
        hFilterString: {},
        showHeroTable: {},
      },
    });
    await userEvent.click(screen.getByRole('button', { name: /change/i }));
    expect(heroProfession).toHaveBeenCalled();
  });
});
