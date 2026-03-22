import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductionTab from './ProductionTab.tsx';
import { renderWithProviders, makeGameApi } from '../test-utils.tsx';

const defaultPotion = {
  id: -1,
  name: 'Healing Herbs',
  description: 'Restores 20% Health',
  count: 0,
  maxCount: 5,
  cost: 10,
  prodTime: 5,
  progress: 'Create Potion',
  sellPrice: 1,
  working: 0,
};

const defaultBuildings = [
  { id: 0, name: 'Tent', count: 0, cost: 0, multiplier: 1, enabled: true },
  { id: 1, name: 'Stockpile', count: 0, cost: 0, multiplier: 1, enabled: true },
  { id: 2, name: 'Market', count: 0, cost: 0, multiplier: 1, enabled: true },
  { id: 3, name: 'Blacksmith', count: 0, cost: 0, multiplier: 1, enabled: true },
];

describe('ProductionTab', () => {
  it('renders the Create Potion button', () => {
    renderWithProviders(<ProductionTab />, {
      stateOverrides: {
        potion: defaultPotion,
        potions: [],
        weapons: [],
        blueprints: [],
        buildings: defaultBuildings,
      },
    });
    expect(screen.getByTestId('potion-create-button')).toBeInTheDocument();
    expect(screen.getByText('Create Potion')).toBeInTheDocument();
  });

  it('disables the Create Potion button when potion count is at max', () => {
    renderWithProviders(<ProductionTab />, {
      stateOverrides: {
        potion: { ...defaultPotion, count: 5, maxCount: 5 },
        potions: [],
        weapons: [],
        blueprints: [],
        buildings: defaultBuildings,
      },
    });
    expect(screen.getByTestId('potion-create-button')).toBeDisabled();
  });

  it('calls game.production.create(-1) when Create Potion clicked', async () => {
    const create = vi.fn();
    const api = makeGameApi({ production: { create, purchaseWeapon: () => {}, incrBlueprint: () => {} } });
    renderWithProviders(<ProductionTab />, {
      gameApi: api,
      stateOverrides: {
        potion: defaultPotion,
        potions: [],
        weapons: [],
        blueprints: [],
        buildings: defaultBuildings,
      },
    });
    await userEvent.click(screen.getByTestId('potion-create-button'));
    expect(create).toHaveBeenCalledWith(-1);
  });

  it('renders enabled weapons when provided', () => {
    const weapon = {
      id: 1,
      name: 'Iron Sword',
      image: 'sword.png',
      enabled: true,
      minDamage: 5,
      maxDamage: 10,
      durability: 100,
      count: 0,
      maxCount: 3,
      cost: 20,
      prodTime: 10,
      sellPrice: 15,
      progress: 'Create Iron Sword',
      heroClass: [],
      working: 0,
    };
    renderWithProviders(<ProductionTab />, {
      stateOverrides: {
        potion: defaultPotion,
        potions: [],
        weapons: [weapon],
        blueprints: [],
        buildings: defaultBuildings,
        heroClass: [],
      },
    });
    expect(screen.getByText('Iron Sword')).toBeInTheDocument();
  });
});
