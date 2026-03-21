/**
 * Bootstrap: orchestrates startup — store setup, API creation, config load, save/load, React mount.
 *
 * Startup order:
 *   1. Bind EconomyService to GameStateService state
 *   2. Apply E2E fast-tick override (dev only)
 *   3. Create Redux store + bind all services (storeSetup)
 *   4. Build game API object (api)
 *   5. Mount React immediately so UI appears
 *   6. Fetch JSON config (heroName, monsterList, dungeons)
 *   7. Load saved game
 */
import { GameStateService, EconomyService } from './container.js';
import bootstrapReact from './bootstrapReact.js';
import { setupStore } from './storeSetup.js';
import { createApi } from './api.js';
import { loadConfig } from './configLoader.js';
import { SaveLoadService } from './container.js';

const state = GameStateService.getState();
EconomyService.bindState(state);

if (import.meta.env.DEV && typeof window !== 'undefined' && window.__HEROVILLE_E2E_FAST_TICK__ != null) {
  const ms = Math.max(2, Math.min(500, Number(window.__HEROVILLE_E2E_FAST_TICK__) || 100));
  state.gameLoop = ms;
}

const { store, syncStoreFromGameState } = setupStore(state);
const { api, appContext } = createApi(store, state, syncStoreFromGameState);

function init() {
  const result = SaveLoadService.load(appContext);
  if (result === 'version_mismatch') api.setDialogState('loading', true);
  else if (result === 'loaded') {
    if (state.showHeroTable) state.showHeroTable.enabled = state.heroTable;
  }
}

export async function run() {
  // Mount React first so UI appears while config and save-data load
  setTimeout(() => bootstrapReact(api, store), 100);
  await loadConfig(state, syncStoreFromGameState);
  setTimeout(init, 500);
}
