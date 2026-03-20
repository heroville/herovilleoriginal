/**
 * Runs the game loop, periodic save, and initial random-event timer.
 * Dispatches thunks so the tick and save are Redux-driven; services (HeroService etc.) still
 * mutate state and dispatch REPLACE_STATE internally.
 * E2E: state.gameLoop may be set to 10 by Playwright before load.
 */
export default function startGameLoopRunner(api, store) {
  if (!api || !api.getState) return;
  if (!store) {
    setInterval(() => { if (api.work) api.work(); if (api.rest) api.rest(); }, api.getState().gameLoop || 1000);
    return;
  }

  const state = api.getState();
  const isFastTickAllowed =
    (typeof window !== 'undefined' && window.__HEROVILLE_E2E_FAST_TICK__) ||
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.MODE === 'test');
  const minGameLoopMs = isFastTickAllowed ? 2 : 10;
  const gameLoopMs = Math.max(minGameLoopMs, Math.min(5000, state.gameLoop || 1000));
  const saveIntervalMs = 30000;

  /** Thunk: run work + rest (HeroService dispatches REPLACE_STATE). */
  const runGameTick = () => (dispatch, getState) => {
    if (api.work) api.work();
    if (api.rest) api.rest();
  };

  /** Thunk: read state and trigger options.save. */
  const runSave = () => (dispatch, getState) => {
    const s = api.getState();
    const heroTable = !!(s && s.showHeroTable && s.showHeroTable.enabled);
    if (api.options && api.options.save) api.options.save({ heroTable });
  };

  setInterval(() => store.dispatch(runGameTick()), gameLoopMs);
  setInterval(() => store.dispatch(runSave()), saveIntervalMs);

  const initialRandomEventDelay = state.randomEventTimer || (600000 + Math.floor(Math.random() * 600000));
  setTimeout(() => {
    if (api.scheduleNextRandomEvent) api.scheduleNextRandomEvent();
  }, initialRandomEventDelay);
}
