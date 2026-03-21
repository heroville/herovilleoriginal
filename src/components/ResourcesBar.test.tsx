import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResourcesBar from './ResourcesBar.tsx';
import { renderWithProviders, makeGameApi } from '../test-utils.tsx';

describe('ResourcesBar', () => {
  it('renders resource counts from Redux state', () => {
    renderWithProviders(<ResourcesBar />, {
      stateOverrides: { resources: 42, maxResources: 100, gold: 10, maxGold: 50 },
    });
    expect(screen.getByTestId('resources-count')).toHaveTextContent('42/100');
  });

  it('calls incrRes when gather button clicked', async () => {
    const incrRes = vi.fn();
    const api = makeGameApi({ incrRes });
    renderWithProviders(<ResourcesBar />, {
      gameApi: api,
      stateOverrides: { resources: 0, maxResources: 100, incr: 1 },
    });
    await userEvent.click(screen.getByTestId('gather-trigger'));
    expect(incrRes).toHaveBeenCalledOnce();
  });

  it('shows error toast when error listener fires', async () => {
    let errorCb: ((msg: string) => void) | null = null;
    const api = makeGameApi({
      registerErrorListener: (fn) => {
        errorCb = fn;
        return () => {};
      },
    });
    renderWithProviders(<ResourcesBar />, { gameApi: api });
    // Simulate service calling showError
    errorCb!('Not enough gold');
    expect(await screen.findByText('Not enough gold')).toBeInTheDocument();
  });
});
