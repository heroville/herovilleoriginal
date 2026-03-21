/**
 * Config loader: fetches heroName, monsterList, and dungeons JSON from the server at startup.
 * Dispatches the loaded data to the Redux config slice.
 */
import { replaceConfig } from './store/slices/configSlice.ts';
import type { AppStore } from './store/index.ts';

export async function loadConfig(store: AppStore): Promise<void> {
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '';
  try {
    const [heroNameRes, monsterRes, dungeonRes] = await Promise.all([
      fetch(base + 'models/heroName.json').then((r) => r.json()),
      fetch(base + 'models/monsterList.json').then((r) => r.json()),
      fetch(base + 'models/dungeons.json').then((r) => r.json()),
    ]);
    const currentConfig = store.getState().config;
    store.dispatch(replaceConfig({
      ...currentConfig,
      heroName: heroNameRes as { first: string[]; title: string[] },
      monsterList: monsterRes as { monsters: Array<{ name: string }> },
      dungeonNames: dungeonRes as { dungeons: string[] },
    }));
  } catch (e) {
    console.warn('Config fetch failed:', e);
  }
}
