import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeroTab from './HeroTab.jsx';
import { renderWithProviders, makeGameApi } from '../test-utils.jsx';

const sampleHero = {
  id: 1,
  name: 'Aria',
  level: 3,
  health: 100,
  currHealth: 80,
  experience: 40,
  next: 75,
  location: 'Town',
  progress: 'Resting',
  equip: { gold: 5, scrap: 2, weapon: null, accessory: [] },
  // academy.id 0 or 2 = adventure hero; id 1 = worker (see heroFilters.js)
  academy: { id: 0, name: 'Fighter' },
  job: null,
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
    const hero2 = { ...sampleHero, id: 2, name: 'Bob', academy: { id: 0, name: 'Fighter' } };
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
    const worker = {
      ...sampleHero,
      id: 3,
      name: 'Carl',
      academy: { id: 1, name: 'Worker' },
      job: { id: 1, name: 'Farmer' },
    };
    const api = makeGameApi({ hero: { heroProfession, addHero: () => {}, addWorker: () => {} } });
    renderWithProviders(<HeroTab />, {
      gameApi: api,
      stateOverrides: {
        heroList: [worker],
        battles: [],
        jobs: [{ id: 1, name: 'Farmer', enabled: true }],
        sorting: { heroTable: 'name', heroWork: 'job.id' },
        hFilterString: {},
        showHeroTable: {},
      },
    });
    await userEvent.click(screen.getByRole('button', { name: /change/i }));
    expect(heroProfession).toHaveBeenCalled();
  });
});
