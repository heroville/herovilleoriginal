/**
 * Config loader: fetches heroName, monsterList, and dungeons JSON from the server at startup.
 * @param {object} state - mutable GameStateService state object
 * @param {Function} syncStore - call to push state changes into the Redux store
 */
export async function loadConfig(state, syncStore) {
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '';
  try {
    const [heroNameRes, monsterRes, dungeonRes] = await Promise.all([
      fetch(base + 'models/heroName.json').then((r) => r.json()),
      fetch(base + 'models/monsterList.json').then((r) => r.json()),
      fetch(base + 'models/dungeons.json').then((r) => r.json()),
    ]);
    state.heroName = heroNameRes;
    state.monsterList = monsterRes;
    state.dungeonNames = dungeonRes;
    syncStore();
  } catch (e) {
    console.warn('Config fetch failed:', e);
  }
}
