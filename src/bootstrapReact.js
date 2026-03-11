/**
 * Mounts React: full App into #app-root with Redux Provider and GameProvider(api).
 * Starts the game loop runner (work/rest, save, initial random event).
 */
import { createRoot } from 'react-dom/client';
import React from 'react';
import { Provider } from 'react-redux';
import startGameLoopRunner from './gameLoopRunner.js';
import { GameProvider } from './contexts/GameContext.jsx';
import App from './components/App.jsx';

export default function bootstrapReact(api, store) {
  if (!api) return;

  const appRoot = document.getElementById('app-root');
  if (appRoot) {
    const app = React.createElement(App);
    const withGame = React.createElement(GameProvider, { api }, app);
    const withStore = store
      ? React.createElement(Provider, { store }, withGame)
      : withGame;
    createRoot(appRoot).render(withStore);
    startGameLoopRunner(api, store);
  }
}
