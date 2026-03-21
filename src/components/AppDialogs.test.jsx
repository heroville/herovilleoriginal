import { describe, it, expect, vi } from 'vitest';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppDialogs from './AppDialogs.jsx';
import { renderWithProviders, makeGameApi } from '../test-utils.jsx';

describe('AppDialogs', () => {
  it('renders nothing when no dialog is open', () => {
    renderWithProviders(<AppDialogs />, {
      gameApi: makeGameApi({ getDialogState: () => ({}) }),
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders hero dialog when dialogState.hero is true', () => {
    let listener;
    const api = makeGameApi({
      getDialogState: () => ({ hero: true }),
      registerDialogListener: (fn) => { listener = fn; return () => {}; },
      newHeroName: () => 'Test Hero',
    });
    renderWithProviders(<AppDialogs />, { gameApi: api });
    expect(screen.getByRole('dialog', { name: /new hero/i })).toBeInTheDocument();
  });

  it('shows validation error when hero Accept clicked with empty name', async () => {
    let listener;
    const api = makeGameApi({
      getDialogState: () => ({ hero: true }),
      registerDialogListener: (fn) => { listener = fn; return () => {}; },
      newHeroName: () => '',
      getState: () => ({ heroList: [] }),
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
      getDialogState: () => ({ hero: true }),
      registerDialogListener: (fn) => () => {},
      newHeroName: () => 'Warrior',
      getState: () => ({ heroList: [] }),
      addHero,
      setDialogState,
    });
    renderWithProviders(<AppDialogs />, { gameApi: api });
    await userEvent.click(screen.getByRole('button', { name: /accept/i }));
    expect(addHero).toHaveBeenCalledWith('Warrior');
  });

  it('renders worker dialog when dialogState.worker is true', () => {
    const api = makeGameApi({
      getDialogState: () => ({ worker: true }),
      registerDialogListener: () => () => {},
      newHeroName: () => 'Worker',
    });
    renderWithProviders(<AppDialogs />, { gameApi: api });
    expect(screen.getByRole('dialog', { name: /new worker/i })).toBeInTheDocument();
  });

  it('renders version dialog when dialogState.version is true', () => {
    const api = makeGameApi({
      getDialogState: () => ({ version: true }),
      registerDialogListener: () => () => {},
    });
    renderWithProviders(<AppDialogs />, { gameApi: api });
    expect(screen.getByRole('dialog', { name: /version information/i })).toBeInTheDocument();
  });

  it('renders confirm dialog when dialogState.confirm is true', () => {
    const api = makeGameApi({
      getDialogState: () => ({ confirm: true }),
      registerDialogListener: () => () => {},
    });
    renderWithProviders(<AppDialogs />, { gameApi: api });
    expect(screen.getByRole('dialog', { name: /confirmation required/i })).toBeInTheDocument();
  });
});
