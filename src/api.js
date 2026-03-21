/**
 * Game API factory: builds the api object consumed by React components via GameContext.
 * Reads all state from the Redux store; all mutations dispatch slice actions.
 */
import {
  GameUiService,
  EconomyService,
  SaveLoadService,
  HeroService,
  BuildingService,
  ProductionService,
} from './container.js';
import { getFlatState } from './services/stateHelpers.js';
import { selectFullState } from './store/index.js';
import { toggleDark, replaceUi } from './store/slices/uiSlice.js';
import { replaceConfig } from './store/slices/configSlice.js';
import { setDamageMulti, setGoldMulti } from './store/slices/economySlice.js';
import { advanceTutorial, skipTutorial, addGameLogMessage } from './store/slices/tutorialSlice.js';

function doRandomEvent(store, type) {
  const randomEventTimer = 600000 + Math.floor(Math.random() * 600000);
  GameUiService.showError('You got ' + type);
  switch (type) {
    case 'Power':
      store.dispatch(setDamageMulti(2));
      setTimeout(() => store.dispatch(setDamageMulti(1)), 300000);
      break;
    case 'Wealth':
      store.dispatch(setGoldMulti(2));
      setTimeout(() => store.dispatch(setGoldMulti(1)), 300000);
      break;
    case 'Speed':
      store.dispatch(replaceConfig({ ...store.getState().config, gameLoop: 500 }));
      setTimeout(
        () => store.dispatch(replaceConfig({ ...store.getState().config, gameLoop: 1000 })),
        60000
      );
      break;
  }
  setTimeout(() => {
    const events = store.getState().config.events || [];
    if (events.length) {
      store.dispatch(
        replaceConfig({
          ...store.getState().config,
          randomE: events[Math.floor(Math.random() * events.length)],
        })
      );
    }
  }, randomEventTimer);
}

/**
 * @param {import('redux').Store} store
 * @returns {{ api: object }}
 */
export function createApi(store) {
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
      SaveLoadService.loadData(null);
    },
    setSortHero(key) {
      const ui = store.getState().ui;
      store.dispatch(replaceUi({ ...ui, sorting: { ...ui.sorting, heroTable: key } }));
    },
    setFilterName(value) {
      const ui = store.getState().ui;
      store.dispatch(replaceUi({ ...ui, hFilterString: { ...ui.hFilterString, name: value } }));
    },
    setHeroTableEnabled(enabled) {
      const ui = store.getState().ui;
      store.dispatch(replaceUi({ ...ui, showHeroTable: { ...ui.showHeroTable, enabled: !!enabled } }));
    },
    setSuccessCount(amount) {
      const ui = store.getState().ui;
      store.dispatch(replaceUi({ ...ui, successCount: { amount: Number(amount) } }));
    },
    setLossCount(amount) {
      const ui = store.getState().ui;
      store.dispatch(replaceUi({ ...ui, lossCount: { amount: Number(amount) } }));
    },
    gameUi: GameUiService,
    town: {
      incrBuilding(building) {
        const { state: st, actions } = BuildingService.buildStateAndActions({
          decResources: (v) => EconomyService.decResources(v),
          decGold: (v) => EconomyService.decGold(v),
        });
        BuildingService.incrBuilding(st, actions, building);
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
        const flat = getFlatState(store);
        const createActions = {
          decResources: (v) => EconomyService.decResources(v),
          showError: (m) => GameUiService.showError(m),
          nextTutorial: () => GameUiService.nextTutorial(),
          disablePotionButton: () => {},
          startCreatePotion: () => ProductionService.createPotion(true, 0, 0, () => {}),
          startCreatePotions: (id) => ProductionService.createPotions(id, true, 0, 0, () => {}),
        };
        ProductionService.create(flat, createActions, itemID);
      },
      purchaseWeapon(weaponID) {
        const flat = getFlatState(store);
        const purchaseWeaponActions = {
          decResources: (v) => EconomyService.decResources(v),
          showError: (m) => GameUiService.showError(m),
          nextTutorial: () => GameUiService.nextTutorial(),
          disableWeaponButton: () => {},
          startBuyWeapon: (id) => ProductionService.buyWeapon(id, true, 0, 0, () => {}),
        };
        ProductionService.purchaseWeapon(flat, purchaseWeaponActions, weaponID);
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
        SaveLoadService.save(null, opts || {});
      },
      load() {
        const result = SaveLoadService.load(null);
        if (result === 'version_mismatch') api.setDialogState('loading', true);
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
      EconomyService.incrRes(multi || store.getState().economy.incr);
    },
    randomEvent(type) {
      doRandomEvent(store, type);
      store.dispatch(replaceConfig({ ...store.getState().config, randomE: null }));
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
      const cfg = store.getState().config;
      if (cfg.events && cfg.events.length) {
        store.dispatch(
          replaceConfig({
            ...cfg,
            randomE: cfg.events[Math.floor(Math.random() * cfg.events.length)],
          })
        );
      }
    },
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

  return { api };
}
