import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppDialogs from './AppDialogs.tsx';
import { renderWithProviders, makeGameApi } from '../test-utils.tsx';
import type { FlatGameState } from '../types/index.ts';

const noDialogs = { hero: false, worker: false, version: false, confirm: false, loading: false };

describe('AppDialogs', () => {
  it('renders nothing when no dialog is open', () => {
    renderWithProviders(<AppDialogs />, {
      gameApi: makeGameApi({ getDialogState: () => ({ ...noDialogs }) }),
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders hero dialog when dialogState.hero is true', () => {
    let _listener: (() => void) | undefined;
    const api = makeGameApi({
      getDialogState: () => ({ ...noDialogs, hero: true }),
      registerDialogListener: (_fn) => { _listener = _fn as unknown as () => void; return () => {}; },
      newHeroName: () => 'Test Hero',
    });
    renderWithProviders(<AppDialogs />, { gameApi: api });
    expect(screen.getByRole('dialog', { name: /new hero/i })).toBeInTheDocument();
  });

  it('shows validation error when hero Accept clicked with empty name', async () => {
    const api = makeGameApi({
      getDialogState: () => ({ ...noDialogs, hero: true }),
      registerDialogListener: (_fn) => () => {},
      newHeroName: () => '',
      getState: () => ({ heroList: [] } as unknown as FlatGameState),
    });
    renderWithProviders(<AppDialogs />, { gameApi: api });
    const input = screen.getByTestId('hero-name-input');
    await userEvent.clear(input);
    await userEvent.click(screen.getByRole('button', { name: /accept/i }));
    expect(screen.getByText(/must enter a valid name/i)).toBeInTheDocument();
  });

  it('calls game.addHero when hero Accept clicked with valid name', async () => {
    const addHero = vi.fn();
    const setDialogState = vi.fn();
    const api = makeGameApi({
      getDialogState: () => ({ ...noDialogs, hero: true }),
      registerDialogListener: (_fn) => () => {},
      newHeroName: () => 'Warrior',
      getState: () => ({ heroList: [] } as unknown as FlatGameState),
      addHero,
      setDialogState,
    });
    renderWithProviders(<AppDialogs />, { gameApi: api });
    await userEvent.click(screen.getByRole('button', { name: /accept/i }));
    expect(addHero).toHaveBeenCalledWith('Warrior');
  });

  it('renders worker dialog when dialogState.worker is true', () => {
    const api = makeGameApi({
      getDialogState: () => ({ ...noDialogs, worker: true }),
      registerDialogListener: () => () => {},
      newHeroName: () => 'Worker',
    });
    renderWithProviders(<AppDialogs />, { gameApi: api });
    expect(screen.getByRole('dialog', { name: /new worker/i })).toBeInTheDocument();
  });

  it('renders version dialog when dialogState.version is true', () => {
    const api = makeGameApi({
      getDialogState: () => ({ ...noDialogs, version: true }),
      registerDialogListener: () => () => {},
    });
    renderWithProviders(<AppDialogs />, { gameApi: api });
    expect(screen.getByRole('dialog', { name: /version information/i })).toBeInTheDocument();
  });

  it('renders confirm dialog when dialogState.confirm is true', () => {
    const api = makeGameApi({
      getDialogState: () => ({ ...noDialogs, confirm: true }),
      registerDialogListener: () => () => {},
    });
    renderWithProviders(<AppDialogs />, { gameApi: api });
    expect(screen.getByRole('dialog', { name: /confirmation required/i })).toBeInTheDocument();
  });
});
