/**
 * Config loader: fetches heroName, monsterList, and dungeons JSON from the server at startup.
 * Dispatches the loaded data to the Redux config slice.
 */
import { replaceConfig } from './store/slices/configSlice.js';
import type { Store } from '@reduxjs/toolkit';

export async function loadConfig(store: Store): Promise<void> {
  const base = (typeof import.meta !== 'undefined' && (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL) || '';
  try {
    const [heroNameRes, monsterRes, dungeonRes] = await Promise.all([
      fetch(base + 'models/heroName.json').then((r) => r.json()),
      fetch(base + 'models/monsterList.json').then((r) => r.json()),
      fetch(base + 'models/dungeons.json').then((r) => r.json()),
    ]);
    store.dispatch(replaceConfig({
      ...(store.getState() as { config: Record<string, unknown> }).config,
      heroName: heroNameRes,
      monsterList: monsterRes,
      dungeonNames: dungeonRes,
    }));
  } catch (e) {
    console.warn('Config fetch failed:', e);
  }
}
