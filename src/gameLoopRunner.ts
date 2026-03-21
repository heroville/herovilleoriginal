/**
 * Runs the game loop, periodic save, and initial random-event timer.
 * Dispatches thunks so the tick and save are Redux-driven; services dispatch
 * fine-grained slice actions directly.
 * E2E: state.gameLoop may be set to 10 by Playwright before load.
 */
import {
  DEFAULT_GAME_LOOP_MS,
  MAX_GAME_LOOP_MS,
  SAVE_INTERVAL_MS,
  RANDOM_EVENT_BASE_DELAY_MS,
} from './constants/gameConstants.ts';
import type { AppStore } from './store/index.ts';
import type { GameApi } from './api.ts';

export default function startGameLoopRunner(api: GameApi, store: AppStore): void {
  if (!api || !api.getState) return;
  if (!store) {
    setInterval(() => {
      if (api.work) api.work();
      if (api.rest) api.rest();
    }, api.getState().gameLoop || 1000);
    return;
  }

  const state = api.getState();
  const isFastTickAllowed =
    (import.meta.env.DEV || import.meta.env.VITE_E2E) &&
    ((typeof window !== 'undefined' && window.__HEROVILLE_E2E_FAST_TICK__) ||
      import.meta.env.MODE === 'test');
  const minGameLoopMs = isFastTickAllowed ? 2 : 10;
  const gameLoopMs = Math.max(minGameLoopMs, Math.min(MAX_GAME_LOOP_MS, state.gameLoop || DEFAULT_GAME_LOOP_MS));
  const saveIntervalMs = SAVE_INTERVAL_MS;

  /** Thunk: run work + rest — HeroService dispatches slice actions. */
  const runGameTick = () => () => {
    if (api.work) api.work();
    if (api.rest) api.rest();
  };

  /** Thunk: read state and trigger options.save. */
  const runSave = () => () => {
    const s = api.getState();
    const heroTable = !!(s && s.showHeroTable && (s.showHeroTable as { enabled?: boolean }).enabled);
    if (api.options && api.options.save) api.options.save({ heroTable });
  };

  setInterval(() => store.dispatch(runGameTick()), gameLoopMs);
  setInterval(() => store.dispatch(runSave()), saveIntervalMs);

  const initialRandomEventDelay =
    (state as typeof state & { randomEventTimer?: number }).randomEventTimer ||
    RANDOM_EVENT_BASE_DELAY_MS + Math.floor(Math.random() * RANDOM_EVENT_BASE_DELAY_MS);
  setTimeout(() => {
    if (api.scheduleNextRandomEvent) api.scheduleNextRandomEvent();
  }, initialRandomEventDelay);
}
