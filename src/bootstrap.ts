/**
 * Bootstrap: orchestrates startup — API creation, config load, save/load, React mount.
 *
 * Startup order:
 *   1. Apply E2E fast-tick override (dev only)
 *   2. Build game API object
 *   3. Mount React immediately so UI appears
 *   4. Fetch JSON config (heroName, monsterList, dungeons)
 *   5. Load saved game
 */
import { store, SaveLoadService } from './container.ts';
import bootstrapReact from './bootstrapReact.ts';
import { createApi } from './api.ts';
import { loadConfig } from './configLoader.ts';
import { replaceConfig } from './store/slices/configSlice.ts';

if ((import.meta.env.DEV || import.meta.env.VITE_E2E) && typeof window !== 'undefined' && window.__HEROVILLE_E2E_FAST_TICK__ != null) {
  const ms = Math.max(2, Math.min(500, Number(window.__HEROVILLE_E2E_FAST_TICK__) || 100));
  store.dispatch(replaceConfig({ ...store.getState().config, gameLoop: ms }));
}

const { api } = createApi(store);

function init(): void {
  const result = SaveLoadService.load(null);
  if (result === 'version_mismatch') api.setDialogState('loading', true);
}

export async function run(): Promise<void> {
  // Mount React first so UI appears while config and save-data load
  setTimeout(() => bootstrapReact(api, store), 100);
  await loadConfig(store);
  setTimeout(init, 500);
}
