/**
 * Test utilities: renderWithProviders wraps a component in Redux Provider + GameProvider.
 * Usage: renderWithProviders(<MyComponent />, { stateOverrides, gameApi })
 */
import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { GameProvider } from './contexts/GameContext.tsx';
import { createGameStore } from './store/index.ts';
import type { GameApi } from './api.ts';
import type { FlatGameState } from './types/index.ts';
import type { AppStore } from './store/index.ts';

/** Minimal default game API stub for tests that don't need real service calls. */
export function makeGameApi(overrides: Partial<GameApi> = {}): GameApi {
  return {
    getState: () => ({} as FlatGameState),
    incrRes: () => {},
    registerErrorListener: () => () => {},
    registerDialogListener: () => () => {},
    getDialogState: () => ({ hero: false, worker: false, version: false, confirm: false, loading: false }),
    setDialogState: () => {},
    notifyError: () => {},
    showError: () => {},
    openHeroDialog: () => {},
    openWorkerDialog: () => {},
    newHeroName: () => 'Test Hero',
    addHero: () => {},
    addWorker: () => {},
    confirmClass: () => {},
    loadData: () => {},
    setSortHero: () => {},
    setFilterName: () => {},
    setHeroTableEnabled: () => {},
    setSuccessCount: () => {},
    setLossCount: () => {},
    gameUi: { register: () => {}, showError: () => {}, nextTutorial: () => {}, checkTutorialProgress: () => {}, openHeroDialog: () => {}, openWorkerDialog: () => {} },
    town: { incrBuilding: () => {} },
    hero: { heroProfession: () => {}, heroClassChange: () => {} },
    production: { create: () => {}, purchaseWeapon: () => {}, incrBlueprint: () => {} },
    options: { save: () => {}, load: () => 'no_data' as const, reset: () => {}, changeTheme: () => {}, skipTut: () => {} },
    _dialogState: { hero: false, worker: false, version: false, confirm: false, loading: false },
    _dialogListeners: [],
    _errorListeners: [],
    nextTutorial: () => {},
    buyUpgrade: () => {},
    randomEvent: () => {},
    showVersion: () => {},
    work: () => {},
    rest: () => {},
    scheduleNextRandomEvent: () => {},
    ...overrides,
  } as GameApi;
}

interface RenderOptions {
  stateOverrides?: Partial<FlatGameState>;
  gameApi?: GameApi;
  store?: AppStore;
}

/**
 * Render a component with Redux store and GameContext.
 */
export function renderWithProviders(ui: React.ReactElement, { stateOverrides = {}, gameApi, store }: RenderOptions = {}) {
  const testStore = store ?? createGameStore(stateOverrides);
  const api = gameApi ?? makeGameApi();

  function Wrapper({ children }: { children?: React.ReactNode }) {
    return (
      <Provider store={testStore}>
        <GameProvider api={api}>{children}</GameProvider>
      </Provider>
    );
  }

  return { store: testStore, ...render(ui, { wrapper: Wrapper }) };
}
