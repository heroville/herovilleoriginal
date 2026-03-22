/**
 * Mounts React: full App into #app-root with Redux Provider and GameProvider(api).
 * Starts the game loop runner (work/rest, save, initial random event).
 */
import { createRoot } from 'react-dom/client';
import React from 'react';
import { Provider } from 'react-redux';
import startGameLoopRunner from './gameLoopRunner.ts';
import { GameProvider } from './contexts/GameContext.tsx';
import App from './components/App.tsx';
import type { AppStore } from './store/index.ts';
import type { GameApi } from './api.ts';

export default function bootstrapReact(api: GameApi, store: AppStore): void {
  if (!api) return;

  const appRoot = document.getElementById('app-root');
  if (appRoot) {
    const app = React.createElement(App);
    const withGame = React.createElement(GameProvider, { api }, app);
    // eslint-disable-next-line react/no-children-prop
    const withStore = store ? React.createElement(Provider, { store, children: withGame }) : withGame;
    createRoot(appRoot).render(withStore);
    startGameLoopRunner(api, store);
  }
}
