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
} from './container.ts';
import { getFlatState } from './services/stateHelpers.ts';
import { selectFullState } from './store/index.ts';
import { toggleDark, replaceUi } from './store/slices/uiSlice.ts';
import { replaceConfig } from './store/slices/configSlice.ts';
import { setDamageMulti, setGoldMulti } from './store/slices/economySlice.ts';
import { advanceTutorial, skipTutorial, addGameLogMessage } from './store/slices/tutorialSlice.ts';
import type { AppStore } from './store/index.ts';
import type { FlatGameState } from './types/index.ts';

type DialogType = 'hero' | 'worker' | 'version' | 'confirm' | 'loading';
type DialogState = Record<DialogType, boolean>;
type DialogListener = (state: DialogState) => void;
type ErrorListener = (msg: string) => void;

function doRandomEvent(store: AppStore, type: string): void {
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

export interface GameApi {
  getState(): FlatGameState;
  _dialogState: DialogState;
  _dialogListeners: DialogListener[];
  getDialogState(): DialogState;
  setDialogState(type: DialogType | string, open: boolean): void;
  registerDialogListener(fn: DialogListener): () => void;
  _errorListeners: ErrorListener[];
  notifyError(msg: string): void;
  registerErrorListener(fn: ErrorListener): () => void;
  showError(msg: string): void;
  openHeroDialog(): void;
  openWorkerDialog(): void;
  addHero(name: string): void;
  addWorker(name: string): void;
  newHeroName(): string;
  confirmClass(): void;
  loadData(): void;
  setSortHero(key: string | string[]): void;
  setFilterName(value: string): void;
  setHeroTableEnabled(enabled: boolean): void;
  setSuccessCount(amount: number): void;
  setLossCount(amount: number): void;
  gameUi: typeof GameUiService;
  town: {
    incrBuilding(building: FlatGameState['buildings'][number]): void;
  };
  hero: {
    heroProfession(selectedJobId: number, heroId: number): void;
    heroClassChange(selectedClassID: number, heroID: number): void;
  };
  production: {
    create(itemID: number): void;
    purchaseWeapon(weaponID: number): void;
    incrBlueprint(blueprint: FlatGameState['blueprints'][number]): void;
  };
  options: {
    save(opts?: { heroTable?: boolean }): void;
    load(): 'loaded' | 'version_mismatch' | 'no_data' | 'parse_error';
    reset(): void;
    changeTheme(): void;
    skipTut(): void;
  };
  nextTutorial(): void;
  buyUpgrade(id: number): void;
  incrRes(multi?: number): void;
  randomEvent(type: string): void;
  showVersion(): void;
  work(): void;
  rest(): void;
  scheduleNextRandomEvent(): void;
}

export function createApi(store: AppStore): { api: GameApi } {
  const api: GameApi = {
    getState() {
      return selectFullState(store.getState());
    },
    _dialogState: { hero: false, worker: false, version: false, confirm: false, loading: false },
    _dialogListeners: [],
    getDialogState() {
      return { ...this._dialogState };
    },
    setDialogState(type: string, open: boolean) {
      (this._dialogState as Record<string, boolean>)[type] = !!open;
      this._dialogListeners.forEach((fn) => fn(this.getDialogState()));
    },
    /** Subscribe to dialog open/close so React can avoid polling. Returns unsubscribe. */
    registerDialogListener(fn: DialogListener) {
      this._dialogListeners.push(fn);
      return () => {
        this._dialogListeners = this._dialogListeners.filter((l) => l !== fn);
      };
    },
    _errorListeners: [],
    /** Notify React of an error message (GameUiService.showError calls this via register). */
    notifyError(msg: string) {
      this._errorListeners.forEach((fn) => fn(msg));
    },
    /** Subscribe to error messages so React can show a toast. Returns unsubscribe. */
    registerErrorListener(fn: ErrorListener) {
      this._errorListeners.push(fn);
      return () => {
        this._errorListeners = this._errorListeners.filter((l) => l !== fn);
      };
    },
    showError(msg: string) {
      api.notifyError(msg);
    },
    openHeroDialog() {
      api.setDialogState('hero', true);
    },
    openWorkerDialog() {
      api.setDialogState('worker', true);
    },
    addHero(name: string) {
      HeroService.addHero(name);
    },
    addWorker(name: string) {
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
    setSortHero(key: string | string[]) {
      const ui = store.getState().ui;
      store.dispatch(replaceUi({ ...ui, sorting: { ...ui.sorting, heroTable: Array.isArray(key) ? key.join(',') : key } }));
    },
    setFilterName(value: string) {
      const ui = store.getState().ui;
      store.dispatch(replaceUi({ ...ui, hFilterString: { ...ui.hFilterString, name: value } }));
    },
    setHeroTableEnabled(enabled: boolean) {
      const ui = store.getState().ui;
      store.dispatch(replaceUi({ ...ui, showHeroTable: { ...ui.showHeroTable, enabled: !!enabled } }));
    },
    setSuccessCount(amount: number) {
      const ui = store.getState().ui;
      store.dispatch(replaceUi({ ...ui, successCount: { amount: Number(amount) } }));
    },
    setLossCount(amount: number) {
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
          decResources: (v: number) => EconomyService.decResources(v),
          showError: (m: string) => GameUiService.showError(m),
          nextTutorial: () => GameUiService.nextTutorial(),
          disablePotionButton: (_id: number) => {},
          startCreatePotion: () => ProductionService.createPotion(true, 0, 0, () => {}),
          startCreatePotions: (id: number) => ProductionService.createPotions(id, true, 0, 0, () => {}),
        };
        ProductionService.create(flat, createActions, itemID);
      },
      purchaseWeapon(weaponID) {
        const flat = getFlatState(store);
        const purchaseWeaponActions = {
          decResources: (v: number) => EconomyService.decResources(v),
          showError: (m: string) => GameUiService.showError(m),
          nextTutorial: () => GameUiService.nextTutorial(),
          disableWeaponButton: (_id: number) => {},
          startBuyWeapon: (id: number) => ProductionService.buyWeapon(id, true, 0, 0, () => {}),
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
      store.dispatch(replaceConfig({ ...store.getState().config, randomE: undefined }));
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

  const origNotifyError = api.notifyError.bind(api);
  api.notifyError = (msg: string) => {
    if (store.getState().tutorial?.tutorialCompleted) store.dispatch(addGameLogMessage(msg));
    origNotifyError(msg);
  };
  GameUiService.register(api);

  return { api };
}
