import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TownTab from './TownTab.jsx';
import { renderWithProviders, makeGameApi } from '../test-utils.jsx';

const sampleBuildings = [
  { id: 0, name: 'Tent', count: 1, cost: 5, enabled: true, description: 'A tent', multiplier: 1.5 },
  { id: 1, name: 'Stockpile', count: 0, cost: 10, enabled: false, description: 'A stockpile', multiplier: 1.5 },
];

describe('TownTab', () => {
  it('renders only enabled buildings', () => {
    renderWithProviders(<TownTab />, {
      stateOverrides: { buildings: sampleBuildings, dungeons: [], bosses: [] },
    });
    expect(screen.getByText('Tent')).toBeInTheDocument();
    expect(screen.queryByText('Stockpile')).not.toBeInTheDocument();
  });

  it('calls town.incrBuilding when Improve button clicked', async () => {
    const incrBuilding = vi.fn();
    const api = makeGameApi({ town: { incrBuilding, incrBlueprint: () => {} } });
    renderWithProviders(<TownTab />, {
      gameApi: api,
      stateOverrides: { buildings: sampleBuildings, dungeons: [], bosses: [] },
    });
    await userEvent.click(screen.getByRole('button', { name: /improve tent/i }));
    expect(incrBuilding).toHaveBeenCalledWith(sampleBuildings[0]);
  });

  it('renders dungeons section heading when dungeons exist', () => {
    const dungeon = { id: 0, name: 'Cave', level: 1, enabled: true, boss: 'Slime', length: 10, encounterRate: 0.5 };
    renderWithProviders(<TownTab />, {
      stateOverrides: { buildings: [], dungeons: [dungeon], bosses: [] },
    });
    expect(screen.getByText('Dungeons')).toBeInTheDocument();
  });
});
