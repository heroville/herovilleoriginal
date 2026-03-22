/**
 * React context for the game API (getState, town, hero, production, options, dialogs, etc.).
 * Provided by bootstrap, consumed via useGame().
 */
import React, { createContext, useContext } from 'react';
import type { GameApi } from '../api.ts';

export const GameContext = createContext<GameApi | null>(null);

export function GameProvider({ api, children }: { api: GameApi; children?: React.ReactNode }) {
  return React.createElement(GameContext.Provider, { value: api }, children);
}

export function useGame(): GameApi {
  const api = useContext(GameContext);
  if (!api) throw new Error('useGame must be used within GameProvider');
  return api;
}
