import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UpgradesTab from './UpgradesTab.jsx';
import { renderWithProviders, makeGameApi } from '../test-utils.jsx';

const sampleUpgrades = [
  { id: 0, name: 'Bonus Resources I', price: 1, enabled: true, purchased: false },
  { id: 1, name: 'Save Point', price: 3, enabled: false, purchased: false },
];

describe('UpgradesTab', () => {
  it('renders enabled upgrades', () => {
    renderWithProviders(<UpgradesTab />, {
      stateOverrides: { upgrades: sampleUpgrades },
    });
    expect(screen.getByText('Bonus Resources I')).toBeInTheDocument();
    // disabled upgrade should not be shown
    expect(screen.queryByText('Save Point')).not.toBeInTheDocument();
  });

  it('calls game.buyUpgrade on upgrade click', async () => {
    const buyUpgrade = vi.fn();
    const api = makeGameApi({ buyUpgrade });
    renderWithProviders(<UpgradesTab />, {
      gameApi: api,
      stateOverrides: { upgrades: sampleUpgrades },
    });
    await userEvent.click(screen.getByRole('button', { name: /bonus resources i/i }));
    expect(buyUpgrade).toHaveBeenCalled();
  });
});
