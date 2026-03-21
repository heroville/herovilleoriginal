/**
 * Test utilities: renderWithProviders wraps a component in Redux Provider + GameProvider.
 * Usage: renderWithProviders(<MyComponent />, { stateOverrides, gameApi })
 */
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { GameProvider } from './contexts/GameContext.jsx';
import { createGameStore } from './store/index.js';

/** Minimal default game API stub for tests that don't need real service calls. */
export function makeGameApi(overrides = {}) {
  return {
    getState: () => ({}),
    incrRes: () => {},
    registerErrorListener: () => () => {},
    registerDialogListener: () => () => {},
    getDialogState: () => ({ hero: false, worker: false, version: false, confirm: false }),
    newHeroName: () => 'Test Hero',
    setSortHero: () => {},
    town: { incrBuilding: () => {}, incrBlueprint: () => {} },
    hero: { addHero: () => {}, addWorker: () => {}, heroProfession: () => {} },
    production: { create: () => {}, purchaseWeapon: () => {}, buyUpgrade: () => {} },
    options: { save: () => {}, load: () => {} },
    dialogs: {},
    ...overrides,
  };
}

/**
 * Render a component with Redux store and GameContext.
 * @param {React.ReactElement} ui
 * @param {{ stateOverrides?: object, gameApi?: object, store?: object }} options
 */
export function renderWithProviders(ui, { stateOverrides = {}, gameApi, store } = {}) {
  const testStore = store ?? createGameStore(stateOverrides);
  const api = gameApi ?? makeGameApi();

  function Wrapper({ children }) {
    return (
      <Provider store={testStore}>
        <GameProvider api={api}>{children}</GameProvider>
      </Provider>
    );
  }

  return { store: testStore, ...render(ui, { wrapper: Wrapper }) };
}
