/**
 * Save/Load/Reset game state to localStorage.
 * Reads from Redux store for save; dispatches all slices on load.
 * No GameStateService — Redux is the single source of truth.
 */
import { getFlatState, dispatchAll } from './stateHelpers.ts';
import { setResources, setGold, setMaxResources, setMaxGold, setIncr } from '../store/slices/economySlice.ts';
import { setTutorialFromSave } from '../store/slices/tutorialSlice.ts';
import type { AppStore } from '../store/index.ts';
import type { GameConfig } from '../types/index.ts';
import type { GameUiServiceInstance } from './gameUi.service.ts';

interface SaveScope {
  heroTable?: boolean;
  skipTut?: boolean;
  nextTutorial?: () => void;
  showError?: (msg: string) => void;
}

interface SaveOpts {
  heroTable?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SavePayload = Record<string, any>;

function SaveLoadServiceFactory(
  GameConfig: GameConfig,
  GameUiService: GameUiServiceInstance,
  store: AppStore
) {
  const HERO_CLASSES = GameConfig.heroClasses || [];

  function reset(): void {
    const raw = localStorage.getItem('data');
    if (!raw) {
      GameUiService.showError('No save data to reset.');
      return;
    }
    let data: SavePayload;
    try {
      data = JSON.parse(raw) as SavePayload;
    } catch (error) {
      GameUiService.showError('Failed to reset save data: ' + (error as Error).message);
      localStorage.removeItem('data');
      return;
    }
    data.saveVersion = 'Reset';
    localStorage.setItem('data', JSON.stringify(data));
    location.reload();
  }

  function buildSavePayload(_scope: SaveScope | null, opts?: SaveOpts): SavePayload {
    const s = getFlatState(store);
    const heroTable = opts && opts.heroTable !== undefined ? opts.heroTable : s.heroTable;
    return {
      resources: s.resources,
      maxResources: s.maxResources,
      gold: s.gold,
      maxGold: s.maxGold,
      incr: s.incr,
      restAmount: s.restAmount,
      buildings: s.buildings,
      blueprints: s.blueprints,
      heroList: s.heroList,
      weapons: s.weapons,
      potions: s.potions,
      upgrades: s.upgrades,
      journeys: s.journeys,
      bossBattle: s.bossBattle,
      battles: s.battles,
      dungeons: s.dungeons,
      jobs: s.jobs,
      potion: s.potion,
      saveVersion: s.version,
      monsters: s.monsters,
      bosses: s.bosses,
      bestiary: s.bestiary,
      heroTable,
      success: s.successCount.amount,
      losses: s.lossCount.amount,
      party: s.party,
      gameStats: s.gameStats,
      tutorialStepIndex: s.tutorialStepIndex,
      tutorialCompleted: s.tutorialCompleted,
      gameLog: s.gameLog || [],
    };
  }

  function save(scope: SaveScope | null, opts?: SaveOpts): void {
    const data = buildSavePayload(scope, opts);
    localStorage.setItem('data', JSON.stringify(data));
    GameUiService.showError('Game has saved');
  }

  /**
   * Apply saved data to the Redux store.
   * @returns true if data was applied, false if no data or parse error
   */
  function loadData(_scope: SaveScope | null, data?: SavePayload): boolean {
    if (data === undefined) {
      const raw = localStorage.getItem('data');
      if (!raw) return false;
      try {
        data = JSON.parse(raw) as SavePayload;
      } catch (error) {
        GameUiService.showError(
          'Failed to load save data. Clearing corrupted save. Error: ' + (error as Error).message
        );
        localStorage.removeItem('data');
        return false;
      }
    }

    // Read current store state to preserve static config (buildings template, weapons template etc.)
    const s = getFlatState(store);

    s.resources = data.resources as number;
    s.maxResources = data.maxResources as number;
    s.gold = data.gold as number;
    s.maxGold = data.maxGold as number;
    s.incr = data.incr as number;
    s.restAmount = data.restAmount as number;
    s.dungeons = data.dungeons as typeof s.dungeons;
    s.monsters = data.monsters as typeof s.monsters;
    s.bosses = data.bosses as typeof s.bosses;

    if (data.buildings && s.buildings) {
      const savedBuildings = data.buildings as typeof s.buildings;
      for (let i = 0; i < savedBuildings.length; i++) {
        s.buildings[i].cost = savedBuildings[i].cost;
        s.buildings[i].count = savedBuildings[i].count;
        s.buildings[i].tier = savedBuildings[i].tier;
        s.buildings[i].enabled = savedBuildings[i].enabled;
      }
    }
    if (data.blueprints && s.blueprints) {
      const savedBlueprints = data.blueprints as typeof s.blueprints;
      for (let i = 0; i < savedBlueprints.length; i++) {
        s.blueprints[i].enabled = savedBlueprints[i].enabled;
      }
    }
    if (data.upgrades && s.upgrades) {
      const savedUpgrades = data.upgrades as Array<{ enabled: boolean; purchased?: boolean }>;
      for (let i = 0; i < savedUpgrades.length; i++) {
        s.upgrades[i].enabled = savedUpgrades[i].enabled;
        if (savedUpgrades[i].purchased !== undefined)
          (s.upgrades[i] as typeof s.upgrades[number] & { purchased?: boolean }).purchased = savedUpgrades[i].purchased ?? false;
      }
    }
    if (data.jobs && s.jobs) {
      const savedJobs = data.jobs as Array<{ enabled?: boolean }>;
      for (let i = 0; i < savedJobs.length; i++) {
        s.jobs[i].enabled = savedJobs[i].enabled;
      }
    }

    s.heroList = (data.heroList as typeof s.heroList) || [];
    const classIds = HERO_CLASSES.length
      ? [HERO_CLASSES[0].id, HERO_CLASSES[2] && HERO_CLASSES[2].id]
      : [];
    for (let i = 0; i < s.heroList.length; i++) {
      const hero = s.heroList[i];
      if (hero.academy && (hero.academy.id === classIds[0] || hero.academy.id === classIds[1])) {
        hero.location = 'Home';
        hero.progress = 'Idle';
      } else {
        hero.progress = 'Idle';
      }
      hero.autoAdventure = false;
      if (hero.job) hero.job.current++;
    }

    if (data.weapons && s.weapons) {
      const savedWeapons = data.weapons as Array<{
        minDamage?: number; cost: number; durability?: number;
        prodTime?: number; count: number; maxCount: number; enabled: boolean;
      }>;
      for (let i = 0; i < savedWeapons.length; i++) {
        if (savedWeapons[i].minDamage !== undefined) s.weapons[i].minDamage = savedWeapons[i].minDamage!;
        s.weapons[i].cost = savedWeapons[i].cost;
        if (savedWeapons[i].durability !== undefined) s.weapons[i].durability = savedWeapons[i].durability!;
        (s.weapons[i] as typeof s.weapons[number] & { prodTime?: number }).prodTime = savedWeapons[i].prodTime;
        s.weapons[i].count = savedWeapons[i].count;
        s.weapons[i].maxCount = savedWeapons[i].maxCount;
        s.weapons[i].enabled = savedWeapons[i].enabled;
        (s.weapons[i] as typeof s.weapons[number] & { working: number }).working = 0;
      }
    }
    if (data.potions && s.potions) {
      const savedPotions = data.potions as Array<{ enabled: boolean }>;
      for (let i = 0; i < savedPotions.length; i++) {
        s.potions[i].enabled = savedPotions[i].enabled;
      }
    }

    s.potion = (data.potion as typeof s.potion) || s.potion;
    if (s.potion) s.potion.working = 0;
    s.bestiary = data.bestiary as boolean;

    if (s.buildings && s.buildings[0]) {
      s.heroEnabled = s.buildings[0].count > 0 ? true : s.heroEnabled;
    }
    if (s.buildings && s.buildings[1]) {
      s.prodEnabled = s.buildings[1].count > 0 ? true : s.prodEnabled;
    }
    if (s.buildings && s.buildings[4]) {
      s.upgEnabled = s.buildings[4].count > 0 ? true : s.upgEnabled;
    }
    if (data.bestiary) {
      s.beastEnabled = true;
    }

    s.heroTable = data.heroTable as boolean;
    s.successCount.amount = data.success !== undefined ? (data.success as number) : s.successCount.amount;
    s.lossCount.amount = data.losses !== undefined ? (data.losses as number) : s.lossCount.amount;
    s.party = (data.party as typeof s.party) || s.party;
    s.gameStats = (data.gameStats as typeof s.gameStats) || s.gameStats;

    s.tutorialStepIndex = (data.tutorialStepIndex as number) ?? 0;
    s.tutorialCompleted = (data.tutorialCompleted as boolean) ?? false;
    s.gameLog = Array.isArray(data.gameLog) ? (data.gameLog as string[]) : [];
    if (s.tutorialCompleted) {
      s.panel = ['Game successfully loaded'];
    }

    // Dispatch all non-economy slices
    dispatchAll(store, s);
    // Dispatch economy: set max values first so resources/gold are clamped correctly
    store.dispatch(setMaxResources(s.maxResources));
    store.dispatch(setMaxGold(s.maxGold));
    store.dispatch(setResources(s.resources));
    store.dispatch(setGold(s.gold));
    store.dispatch(setIncr(s.incr));
    // Dispatch tutorial state
    store.dispatch(setTutorialFromSave({
      tutorialStepIndex: s.tutorialStepIndex,
      tutorialCompleted: s.tutorialCompleted,
      gameLog: s.gameLog,
    }));

    return true;
  }

  /**
   * Load from localStorage; check version; apply if match.
   * @returns 'loaded'|'version_mismatch'|'no_data'|'parse_error'
   */
  function load(_scope: SaveScope | null): 'loaded' | 'version_mismatch' | 'no_data' | 'parse_error' {
    const raw = localStorage.getItem('data');
    if (!raw) return 'no_data';
    let test: SavePayload;
    try {
      test = JSON.parse(raw) as SavePayload;
    } catch (error) {
      GameUiService.showError(
        'Failed to parse save data. Clearing corrupted save. Error: ' + (error as Error).message
      );
      localStorage.removeItem('data');
      return 'parse_error';
    }
    if (!test) return 'no_data';
    if (test.saveVersion === 'Reset') {
      localStorage.removeItem('data');
      return 'no_data';
    }
    const currentVersion = store.getState().ui.version;
    if (test.saveVersion !== currentVersion) {
      return 'version_mismatch';
    }
    loadData(null, test);
    return 'loaded';
  }

  return {
    reset,
    save,
    load,
    loadData,
    buildSavePayload,
  };
}

export type SaveLoadServiceInstance = ReturnType<typeof SaveLoadServiceFactory>;

export default SaveLoadServiceFactory;
