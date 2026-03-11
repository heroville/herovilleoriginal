/**
 * React context for the game API (getState, town, hero, production, options, dialogs, etc.).
 * Provided by bootstrap, consumed via useGame().
 */
import React, { createContext, useContext } from 'react';

export const GameContext = createContext(null);

export function GameProvider({ api, children }) {
  return React.createElement(GameContext.Provider, { value: api }, children);
}

export function useGame() {
  const api = useContext(GameContext);
  if (!api) throw new Error('useGame must be used within GameProvider');
  return api;
}
