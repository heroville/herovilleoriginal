/**
 * Bootstrap: wires services from container, creates Redux store, builds game API, fetches config, runs load, mounts React.
 * Store is hydrated from GameStateService; api.getState() returns selectFullState(store.getState()). Services dispatch
 * REPLACE_STATE after mutations; bootstrap uses syncStoreFromGameState() after randomEvent, loadConfig, town.incrBuilding, and UI setters.
 */
import {
  GameStateService,
  GameUiService,
  EconomyService,
  SaveLoadService,
  HeroService,
  BuildingService,
  ProductionService,
  UiService,
  DungeonService,
  CombatService,
} from './container.js';
import bootstrapReact from './bootstrapReact.js';
import { createGameStore, selectFullState, replaceStateFromFlat } from './store/index.js';
import { toggleDark } from './store/slices/uiSlice.js';
import { advanceTutorial, skipTutorial, addGameLogMessage } from './store/slices/tutorialSlice.js';


const state = GameStateService.getState();
EconomyService.bindState(state);

if (import.meta.env.DEV && typeof window !== 'undefined' && window.__HEROVILLE_E2E_FAST_TICK__ != null) {
  const ms = Math.max(2, Math.min(500, Number(window.__HEROVILLE_E2E_FAST_TICK__) || 100));
  state.gameLoop = ms;
}

/** Redux store; single source of truth for React. Hydrated from GameStateService, synced after mutations until services dispatch. */
const store = createGameStore(state);

/** Keep GameStateService in sync with Redux tutorial state so save/load and service triggers work. */
store.subscribe(() => {
  const s = store.getState();
  if (s.tutorial) {
    const flat = GameStateService.getState();
    flat.tutorialStepIndex = s.tutorial.tutorialStepIndex;
    flat.tutorialCompleted = s.tutorial.tutorialCompleted;
    flat.gameLog = s.tutorial.gameLog || [];
  }
});

/** So EconomyService dispatches economy/gameStats actions; dual-writes keep GameStateService in sync for other services. */
EconomyService.bindStore(store, () => selectFullState(store.getState()));
/** BuildingService dispatches REPLACE_STATE after incrBuilding/incrBlueprint so store stays in sync. */
BuildingService.bindStore(store);
/** HeroService dispatches REPLACE_STATE after hero/work/rest mutations. */
HeroService.bindStore(store);
/** ProductionService dispatches REPLACE_STATE after create, purchaseWeapon, buyUpgrade and when production completes. */
ProductionService.bindStore(store);
/** SaveLoadService dispatches REPLACE_STATE after loadData. */
SaveLoadService.bindStore(store);
/** UiService dispatches REPLACE_STATE after nextTutorial and showError (when panel mutates). */
UiService.bindStore(store);
/** DungeonService dispatches REPLACE_STATE after activateDungeon, travel (progress), and monsterFight. */
DungeonService.bindStore(store);
/** CombatService dispatches REPLACE_STATE after takeTurn (battles, heroes, gameStats). */
CombatService.bindStore(store);

/** Syncs Redux store from current GameStateService state. Used by bootstrap after randomEvent, loadConfig, town.incrBuilding, and UI state setters. */
function syncStoreFromGameState() {
  replaceStateFromFlat(store, GameStateService.getState());
}

const api = {
  getState() {
    return selectFullState(store.getState());
  },
  _dialogState: { hero: false, worker: false, version: false, confirm: false, loading: false },
  _dialogListeners: [],
  getDialogState() {
    return { ...this._dialogState };
  },
  setDialogState(type, open) {
    this._dialogState[type] = !!open;
    this._dialogListeners.forEach((fn) => fn(this.getDialogState()));
  },
  /** Subscribe to dialog open/close so React can avoid polling. Returns unsubscribe. */
  registerDialogListener(fn) {
    this._dialogListeners.push(fn);
    return () => {
      this._dialogListeners = this._dialogListeners.filter((l) => l !== fn);
    };
  },
  _errorListeners: [],
  /** Notify React of an error message (UiService.showError calls this). */
  notifyError(msg) {
    this._errorListeners.forEach((fn) => fn(msg));
  },
  /** Subscribe to error messages so React can show a toast. Returns unsubscribe. */
  registerErrorListener(fn) {
    this._errorListeners.push(fn);
    return () => {
      this._errorListeners = this._errorListeners.filter((l) => l !== fn);
    };
  },
  addHero(name) {
    HeroService.addHero(name);
    /* HeroService dispatches REPLACE_STATE internally. */
  },
  addWorker(name) {
    HeroService.addWorker(name);
    /* HeroService dispatches REPLACE_STATE internally. */
  },
  newHeroName() {
    return HeroService.newHeroName();
  },
  confirmClass() {
    HeroService.confirmClass();
    /* HeroService dispatches REPLACE_STATE internally. */
  },
  loadData() {
    if (SaveLoadService.loadData(appContext)) {
      const s = state;
      if (s.showHeroTable) s.showHeroTable.enabled = s.heroTable;
    }
    /* SaveLoadService dispatches REPLACE_STATE after loadData when data was applied. */
  },
  /** UI state updates (Hero tab sort/filter, Options toggles) so components using useSelector see updates. */
  setSortHero(key) {
    if (!state.sorting) state.sorting = {};
    state.sorting.heroTable = key;
    syncStoreFromGameState();
  },
  setFilterName(value) {
    if (!state.hFilterString) state.hFilterString = {};
    state.hFilterString.name = value;
    syncStoreFromGameState();
  },
  setHeroTableEnabled(enabled) {
    if (state.showHeroTable) state.showHeroTable.enabled = !!enabled;
    syncStoreFromGameState();
  },
  setSuccessCount(amount) {
    if (state.successCount) state.successCount.amount = Number(amount);
    syncStoreFromGameState();
  },
  setLossCount(amount) {
    if (state.lossCount) state.lossCount.amount = Number(amount);
    syncStoreFromGameState();
  },
  gameUi: GameUiService,
  town: {
    incrBuilding(building) {
      const { state: st, actions } = BuildingService.buildStateAndActions({
        decResources: (v) => EconomyService.decResources(v),
        decGold: (v) => EconomyService.decGold(v),
      });
      BuildingService.incrBuilding(st, actions, building);
      /* BuildingService dispatches REPLACE_STATE; ensure store has latest (E2E: React reads store). */
      syncStoreFromGameState();
    },
  },
  hero: {
    heroProfession(selectedJobId, heroId) {
      HeroService.heroProfession(selectedJobId, heroId);
      /* HeroService dispatches REPLACE_STATE internally. */
    },
    heroClassChange(selectedClassID, heroID) {
      HeroService.heroClassChange(selectedClassID, heroID);
      api.setDialogState('confirm', true);
      /* HeroService dispatches REPLACE_STATE internally. */
    },
  },
  production: {
    create(itemID) {
      const s = GameStateService.getState();
      const createState = {
        potion: s.potion,
        potions: s.potions,
        get resources() {
          return s.resources;
        },
        get panelNumber() {
          return s.panelNumber;
        },
        get tutorialStepIndex() {
          return s.tutorialStepIndex;
        },
      };
      const createActions = {
        decResources: (v) => EconomyService.decResources(v),
        showError: (m) => GameUiService.showError(m),
        nextTutorial: () => GameUiService.nextTutorial(),
        disablePotionButton: () => {},
        startCreatePotion: () => ProductionService.createPotion(true, 0, 0, () => {}),
        startCreatePotions: (id) => ProductionService.createPotions(id, true, 0, 0, () => {}),
      };
      ProductionService.create(createState, createActions, itemID);
      /* ProductionService dispatches REPLACE_STATE internally. */
    },
    purchaseWeapon(weaponID) {
      const s = GameStateService.getState();
      const purchaseWeaponState = {
        weapons: s.weapons,
        get resources() {
          return s.resources;
        },
        buildings: s.buildings,
        upgrades: s.upgrades,
        gameStats: s.gameStats,
        get panelNumber() {
          return s.panelNumber;
        },
        get tutorialStepIndex() {
          return s.tutorialStepIndex;
        },
      };
      const purchaseWeaponActions = {
        decResources: (v) => EconomyService.decResources(v),
        showError: (m) => GameUiService.showError(m),
        nextTutorial: () => GameUiService.nextTutorial(),
        disableWeaponButton: () => {},
        startBuyWeapon: (id) => ProductionService.buyWeapon(id, true, 0, 0, () => {}),
      };
      ProductionService.purchaseWeapon(purchaseWeaponState, purchaseWeaponActions, weaponID);
      /* ProductionService dispatches REPLACE_STATE internally. */
    },
    incrBlueprint(blueprint) {
      const { state: st, actions } = BuildingService.buildStateAndActions({
        decResources: (v) => EconomyService.decResources(v),
        decGold: (v) => EconomyService.decGold(v),
      });
      BuildingService.incrBlueprint(st, actions, blueprint);
      /* BuildingService dispatches REPLACE_STATE internally. */
    },
  },
  options: {
    save(opts) {
      SaveLoadService.save(appContext, opts || {});
      /* save() does not mutate state; no sync needed. */
    },
    load() {
      const result = SaveLoadService.load(appContext);
      if (result === 'version_mismatch') api.setDialogState('loading', true);
      else if (result === 'loaded') {
        const s = state;
        if (s.showHeroTable) s.showHeroTable.enabled = s.heroTable;
      }
      /* SaveLoadService.load → loadData dispatches REPLACE_STATE when loaded. */
      return result;
    },
    reset() {
      SaveLoadService.reset();
      /* reset() reloads the page; no sync needed. */
    },
    changeTheme() {
      store.dispatch(toggleDark());
    },
    skipTut() {
      store.dispatch(skipTutorial());
    },
  },
  nextTutorial() {
    store.dispatch(advanceTutorial());
  },
  buyUpgrade(id) {
    ProductionService.buyUpgrade(id);
    /* ProductionService dispatches REPLACE_STATE internally. */
  },
  incrRes(multi) {
    EconomyService.incrRes(multi || state.incr);
    /* Economy updates go through Redux; no syncStore needed for gather. */
  },
  randomEvent(type) {
    doRandomEvent(type);
    state.randomE = null;
    syncStoreFromGameState();
  },
  showVersion() {
    api.setDialogState('version', true);
  },
  work() {
    HeroService.work();
    /* HeroService dispatches REPLACE_STATE internally. */
  },
  rest() {
    HeroService.rest();
    /* HeroService dispatches REPLACE_STATE internally. */
  },
  /** Called by game loop when the initial random-event timer fires; updates store so UI shows the event. */
  scheduleNextRandomEvent() {
    const s = state;
    if (s && s.events && s.events.length) {
      s.randomE = s.events[Math.floor(Math.random() * s.events.length)];
      syncStoreFromGameState();
    }
  },
};

/** Context passed to services that need state + UI callbacks (replaces legacy scope). */
const appContext = {
  get state() {
    return state;
  },
  getFlatState: () => state,
  forceReset: true,
  notifyError: (msg) => api.notifyError(msg),
  setDialogState: (type, open) => api.setDialogState(type, open),
  nextTutorial: () => store.dispatch(advanceTutorial()),
  skipTut: () => store.dispatch(skipTutorial()),
  changeTheme: () => store.dispatch(toggleDark()),
};

api.showError = (msg) => api.notifyError(msg);
api.nextTutorial = () => store.dispatch(advanceTutorial());
api.openHeroDialog = () => api.setDialogState('hero', true);
api.openWorkerDialog = () => api.setDialogState('worker', true);
const origNotifyError = api.notifyError.bind(api);
api.notifyError = (msg) => {
  if (store.getState().tutorial?.tutorialCompleted) store.dispatch(addGameLogMessage(msg));
  origNotifyError(msg);
};
GameUiService.register(api);

function doRandomEvent(type) {
  const s = state;
  s.randomEventTimer = 600000 + Math.floor(Math.random() * 600000);
  GameUiService.showError('You got ' + type);
  switch (type) {
    case 'Power':
      s.damageMulti = 2;
      setTimeout(() => (s.damageMulti = 1), 300000);
      break;
    case 'Wealth':
      s.goldMulti = 2;
      setTimeout(() => (s.goldMulti = 1), 300000);
      break;
    case 'Speed':
      s.gameLoop = 500;
      setTimeout(() => (s.gameLoop = 1000), 60000);
      break;
  }
  setTimeout(() => {
    s.randomE = s.events[Math.floor(Math.random() * s.events.length)];
    syncStoreFromGameState();
  }, s.randomEventTimer);
}

function init() {
  const result = SaveLoadService.load(appContext);
  if (result === 'version_mismatch') api.setDialogState('loading', true);
  else if (result === 'loaded') {
    const s = state;
    if (s.showHeroTable) s.showHeroTable.enabled = s.heroTable;
  }
  /* SaveLoadService.load → loadData dispatches REPLACE_STATE when loaded. */
}

async function loadConfig() {
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
    syncStoreFromGameState();
  } catch (e) {
    console.warn('Config fetch failed:', e);
  }
}

export async function run() {
  // Mount React soon so UI is visible; load config and init in parallel
  setTimeout(() => bootstrapReact(api, store), 100);
  await loadConfig();
  setTimeout(init, 500);
}
