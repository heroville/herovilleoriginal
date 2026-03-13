/**
 * Converts between flat game state (used by services and UI) and sliced Redux state.
 * Used for store hydration, replaceState sync, and selectFullState for getState().
 */
import { createSelector } from '@reduxjs/toolkit';

/**
 * Maps flat state from GameStateService.getState() into slice keys for the Redux store.
 * @param {Object} flat - Flat state object (resources, gold, buildings, heroList, etc.)
 * @returns {Object} Sliced state { economy, ui, config, buildings, heroes, dungeons, production, jobs, upgrades, gameStats }
 */
export function stateToSlices(flat) {
  if (!flat) return getEmptySlices();
  return {
    economy: {
      resources: flat.resources ?? 0,
      maxResources: flat.maxResources ?? 25,
      gold: flat.gold ?? 0,
      maxGold: flat.maxGold ?? 0,
      incr: flat.incr ?? 1,
      damageMulti: flat.damageMulti ?? 1,
      goldMulti: flat.goldMulti ?? 1
    },
    tutorial: {
      tutorialStepIndex: flat.tutorialStepIndex ?? 0,
      tutorialCompleted: flat.tutorialCompleted ?? false,
      gameLog: flat.gameLog ?? []
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
      selectedDungeon: flat.selectedDungeon ?? 0
    },
    config: {
      gameLoop: flat.gameLoop ?? 1000,
      randomE: flat.randomE,
      randomEventTimer: flat.randomEventTimer,
      restAmount: flat.restAmount ?? 2,
      heroName: flat.heroName,
      monsterList: flat.monsterList,
      dungeonNames: flat.dungeonNames,
      tempClass: flat.tempClass,
      tempHero: flat.tempHero,
      events: flat.events ?? [],
      heroClass: flat.heroClass ?? []
    },
    buildings: flat.buildings ?? [],
    heroes: {
      heroList: flat.heroList ?? [],
      battles: flat.battles ?? [],
      journeys: flat.journeys ?? [],
      party: flat.party ?? [],
      bossBattle: flat.bossBattle ?? []
    },
    dungeons: {
      dungeons: flat.dungeons ?? [],
      monsters: flat.monsters ?? [],
      bosses: flat.bosses ?? []
    },
    production: {
      potion: flat.potion ?? {},
      potions: flat.potions ?? [],
      weapons: flat.weapons ?? [],
      blueprints: flat.blueprints ?? []
    },
    jobs: flat.jobs ?? [],
    upgrades: flat.upgrades ?? [],
    gameStats: flat.gameStats ? { ...flat.gameStats } : {}
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
    showTutorial: true
  });
}

/**
 * Merges sliced Redux state back into a single flat object for components and services.
 * Memoized so the same state reference returns the same flat reference (avoids unnecessary rerenders).
 * Used by api.getState() so existing code that reads state.resources, state.heroList, etc. keeps working.
 */
function selectFullStateUnmemoized(state) {
  if (!state) return {};
  const e = state.economy ?? {};
  const u = state.ui ?? {};
  const t = state.tutorial ?? {};
  const c = state.config ?? {};
  const h = state.heroes ?? {};
  const d = state.dungeons ?? {};
  const p = state.production ?? {};
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
    potion: p.potion ?? {},
    potions: p.potions ?? [],
    weapons: p.weapons ?? [],
    blueprints: p.blueprints ?? [],
    gameStats: state.gameStats ?? {}
  };
}

/** Memoized selector: same state reference => same flat state reference. */
export const selectFullState = createSelector(
  [(state) => state],
  selectFullStateUnmemoized
);

/** Action type for replacing entire store state from flat state. */
export const REPLACE_STATE = 'game/replaceState';
