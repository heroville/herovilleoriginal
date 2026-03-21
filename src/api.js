/**
 * Game API factory: builds the api object consumed by React components via GameContext.
 * api is passed to bootstrapReact and exposed on window.__HEROVILLE_E2E_STATE__ in dev.
 */
import {
  GameStateService,
  GameUiService,
  EconomyService,
  SaveLoadService,
  HeroService,
  BuildingService,
  ProductionService,
} from './container.js';
import { selectFullState } from './store/index.js';
import { toggleDark } from './store/slices/uiSlice.js';
import { advanceTutorial, skipTutorial, addGameLogMessage } from './store/slices/tutorialSlice.js';

function doRandomEvent(type, state, syncStore) {
  state.randomEventTimer = 600000 + Math.floor(Math.random() * 600000);
  GameUiService.showError('You got ' + type);
  switch (type) {
    case 'Power':
      state.damageMulti = 2;
      setTimeout(() => (state.damageMulti = 1), 300000);
      break;
    case 'Wealth':
      state.goldMulti = 2;
      setTimeout(() => (state.goldMulti = 1), 300000);
      break;
    case 'Speed':
      state.gameLoop = 500;
      setTimeout(() => (state.gameLoop = 1000), 60000);
      break;
  }
  setTimeout(() => {
    state.randomE = state.events[Math.floor(Math.random() * state.events.length)];
    syncStore();
  }, state.randomEventTimer);
}

/**
 * @param {import('redux').Store} store
 * @param {object} state - flat GameStateService state
 * @param {Function} syncStoreFromGameState
 * @returns {{ api: object, appContext: object }}
 */
export function createApi(store, state, syncStoreFromGameState) {
  // appContext is defined after api but before any call to api methods that use it.
  // eslint-disable-next-line prefer-const
  let appContext;

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
    /** Notify React of an error message (GameUiService.showError calls this via register). */
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
    },
    addWorker(name) {
      HeroService.addWorker(name);
    },
    newHeroName() {
      return HeroService.newHeroName();
    },
    confirmClass() {
      HeroService.confirmClass();
    },
    loadData() {
      if (SaveLoadService.loadData(appContext)) {
        if (state.showHeroTable) state.showHeroTable.enabled = state.heroTable;
      }
    },
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
        syncStoreFromGameState();
      },
    },
    hero: {
      heroProfession(selectedJobId, heroId) {
        HeroService.heroProfession(selectedJobId, heroId);
      },
      heroClassChange(selectedClassID, heroID) {
        HeroService.heroClassChange(selectedClassID, heroID);
        api.setDialogState('confirm', true);
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
      },
      incrBlueprint(blueprint) {
        const { state: st, actions } = BuildingService.buildStateAndActions({
          decResources: (v) => EconomyService.decResources(v),
          decGold: (v) => EconomyService.decGold(v),
        });
        BuildingService.incrBlueprint(st, actions, blueprint);
      },
    },
    options: {
      save(opts) {
        SaveLoadService.save(appContext, opts || {});
      },
      load() {
        const result = SaveLoadService.load(appContext);
        if (result === 'version_mismatch') api.setDialogState('loading', true);
        else if (result === 'loaded') {
          if (state.showHeroTable) state.showHeroTable.enabled = state.heroTable;
        }
        return result;
      },
      reset() {
        SaveLoadService.reset();
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
    },
    incrRes(multi) {
      EconomyService.incrRes(multi || state.incr);
    },
    randomEvent(type) {
      doRandomEvent(type, state, syncStoreFromGameState);
      state.randomE = null;
      syncStoreFromGameState();
    },
    showVersion() {
      api.setDialogState('version', true);
    },
    work() {
      HeroService.work();
    },
    rest() {
      HeroService.rest();
    },
    /** Called by game loop when the random-event timer fires; updates store so UI shows the event. */
    scheduleNextRandomEvent() {
      if (state && state.events && state.events.length) {
        state.randomE = state.events[Math.floor(Math.random() * state.events.length)];
        syncStoreFromGameState();
      }
    },
  };

  /** Context passed to services that need state + UI callbacks (replaces legacy Angular $scope). */
  appContext = {
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

  return { api, appContext };
}
