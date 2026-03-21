/**
 * Converts between flat game state (used by services and UI) and sliced Redux state.
 * Used for store hydration, replaceState sync, and selectFullState for getState().
 */
import { createSelector } from '@reduxjs/toolkit';
import type { RootState, FlatGameState } from '../types/index.ts';

/**
 * Maps flat state from GameStateService.getState() into slice keys for the Redux store.
 */
export function stateToSlices(flat: Partial<FlatGameState>): Partial<RootState> {
  if (!flat) return getEmptySlices() as Partial<RootState>;
  return {
    economy: {
      resources: flat.resources ?? 0,
      maxResources: flat.maxResources ?? 25,
      gold: flat.gold ?? 0,
      maxGold: flat.maxGold ?? 0,
      incr: flat.incr ?? 1,
      damageMulti: flat.damageMulti ?? 1,
      goldMulti: flat.goldMulti ?? 1,
    },
    tutorial: {
      tutorialStepIndex: flat.tutorialStepIndex ?? 0,
      tutorialCompleted: flat.tutorialCompleted ?? false,
      gameLog: flat.gameLog ?? [],
    },
    ui: {
      panel: flat.panel ?? [],
      panelNumber: flat.panelNumber ?? 0,
      showTutorial: flat.showTutorial ?? true,
      panelInfo: flat.panelInfo ?? false,
      dark: flat.dark ?? false,
      sorting: flat.sorting ?? {},
      showHeroTable: flat.showHeroTable ?? {},
      heroTable: flat.heroTable ?? false,
      heroEnabled: flat.heroEnabled ?? false,
      prodEnabled: flat.prodEnabled ?? false,
      upgEnabled: flat.upgEnabled ?? false,
      beastEnabled: flat.beastEnabled ?? false,
      hFilterString: flat.hFilterString ?? {},
      heroCollapse: flat.heroCollapse ?? true,
      successCount: flat.successCount ?? { amount: 3 },
      lossCount: flat.lossCount ?? { amount: 1 },
      optionsSuccess: flat.optionsSuccess ?? [],
      optionsLoss: flat.optionsLoss ?? [],
      version: flat.version ?? '2.0',
      bestiary: flat.bestiary ?? false,
      predicate: flat.predicate ?? 'name',
      selectedDungeon: flat.selectedDungeon ?? 0,
    },
    config: {
      gameLoop: flat.gameLoop ?? 1000,
      randomE: flat.randomE,
      randomEventTimer: flat.randomEventTimer,
      restAmount: flat.restAmount ?? 2,
      heroName: flat.heroName ?? null,
      monsterList: flat.monsterList ?? null,
      dungeonNames: flat.dungeonNames ?? null,
      tempClass: flat.tempClass ?? null,
      tempHero: flat.tempHero ?? null,
      events: flat.events ?? [],
      heroClass: flat.heroClass ?? [],
    },
    buildings: flat.buildings ?? [],
    heroes: {
      heroList: flat.heroList ?? [],
      battles: flat.battles ?? [],
      journeys: flat.journeys ?? [],
      party: flat.party ?? [],
      bossBattle: flat.bossBattle ?? [],
    },
    dungeons: {
      dungeons: flat.dungeons ?? [],
      monsters: flat.monsters ?? [],
      bosses: flat.bosses ?? [],
    },
    production: {
      potion: flat.potion ?? ({} as FlatGameState['potion']),
      potions: flat.potions ?? [],
      weapons: flat.weapons ?? [],
      blueprints: flat.blueprints ?? [],
    },
    jobs: flat.jobs ?? [],
    upgrades: flat.upgrades ?? [],
    gameStats: flat.gameStats ? { ...flat.gameStats } : ({} as FlatGameState['gameStats']),
  };
}

/**
 * Returns empty slice shape for initial state when no flat state is provided.
 */
function getEmptySlices() {
  return stateToSlices({
    resources: 0,
    maxResources: 25,
    gold: 0,
    maxGold: 0,
    panel: [],
    panelNumber: 0,
    showTutorial: true,
  });
}

/**
 * Merges sliced Redux state back into a single flat object for components and services.
 * Used by api.getState() so existing code that reads state.resources, state.heroList, etc. keeps working.
 */
function selectFullStateUnmemoized(state: Partial<RootState>): FlatGameState {
  if (!state) return {} as FlatGameState;
  const e = state.economy ?? ({} as RootState['economy']);
  const u = state.ui ?? ({} as RootState['ui']);
  const t = state.tutorial ?? ({} as RootState['tutorial']);
  const c = state.config ?? ({} as RootState['config']);
  const h = state.heroes ?? ({} as RootState['heroes']);
  const d = state.dungeons ?? ({} as RootState['dungeons']);
  const p = state.production ?? ({} as RootState['production']);
  return {
    ...e,
    ...u,
    tutorialStepIndex: t.tutorialStepIndex,
    tutorialCompleted: t.tutorialCompleted,
    gameLog: t.gameLog,
    ...c,
    buildings: state.buildings ?? [],
    jobs: state.jobs ?? [],
    upgrades: state.upgrades ?? [],
    heroList: h.heroList ?? [],
    battles: h.battles ?? [],
    journeys: h.journeys ?? [],
    party: h.party ?? [],
    bossBattle: h.bossBattle ?? [],
    dungeons: d.dungeons ?? [],
    monsters: d.monsters ?? [],
    bosses: d.bosses ?? [],
    potion: p.potion ?? ({} as FlatGameState['potion']),
    potions: p.potions ?? [],
    weapons: p.weapons ?? [],
    blueprints: p.blueprints ?? [],
    gameStats: state.gameStats ?? ({} as FlatGameState['gameStats']),
  } as FlatGameState;
}

/**
 * Selector: inputs are slice references so recomputation only runs when a used slice changes.
 */
export const selectFullState = createSelector(
  [
    (state: RootState) => state?.economy,
    (state: RootState) => state?.ui,
    (state: RootState) => state?.tutorial,
    (state: RootState) => state?.config,
    (state: RootState) => state?.buildings,
    (state: RootState) => state?.heroes,
    (state: RootState) => state?.dungeons,
    (state: RootState) => state?.production,
    (state: RootState) => state?.jobs,
    (state: RootState) => state?.upgrades,
    (state: RootState) => state?.gameStats,
  ],
  (
    economy,
    ui,
    tutorial,
    config,
    buildings,
    heroes,
    dungeons,
    production,
    jobs,
    upgrades,
    gameStats
  ) =>
    selectFullStateUnmemoized({
      economy,
      ui,
      tutorial,
      config,
      buildings,
      heroes,
      dungeons,
      production,
      jobs,
      upgrades,
      gameStats,
    })
);

