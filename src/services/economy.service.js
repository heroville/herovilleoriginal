/**
 * Economy service: resources and gold (increment, decrement).
 * When store is bound via bindStore(), updates go through Redux dispatch and are also written to boundState
 * so other services (BuildingService, etc.) that read GameStateService.getState() stay in sync.
 */
import { setResources, setGold } from '../store/slices/economySlice.js';
import { incrementClicks } from '../store/slices/gameStatsSlice.js';

function ensureState(state) {
  if (!state) {
    throw new Error('EconomyService requires a bound state before use.');
  }
  return state;
}

function EconomyServiceFactory(GameUiService) {
  var boundState = null;
  /** When set, economy updates are dispatched to the store and dual-written to boundState. */
  var _dispatch = null;
  var _getFlatState = null;

  function getState() {
    return ensureState(boundState);
  }

  function bindState(state) {
    boundState = state;
    return boundState;
  }

  /**
   * Binds the Redux store so economy updates dispatch actions. getFlatState should return
   * selectFullState(store.getState()). We still dual-write to boundState so callers that
   * read GameStateService.getState() see the same values.
   */
  function bindStore(store, getFlatState) {
    if (!store || !getFlatState) return;
    _dispatch = store.dispatch;
    _getFlatState = getFlatState;
  }

  function checkTutorialAfterUpdate() {
    if (GameUiService && typeof GameUiService.checkTutorialProgress === 'function') {
      GameUiService.checkTutorialProgress(getState());
    }
  }

  function incResources(value) {
    var state = getState();
    var amount = Number(value) || 0;
    var availableSpace = state.maxResources - state.resources;
    var newResources = amount < availableSpace ? state.resources + amount : state.maxResources;

    if (_dispatch) {
      _dispatch(setResources(newResources));
    }
    state.resources = newResources;
    checkTutorialAfterUpdate();
    return state.resources;
  }

  function decResources(value) {
    var state = getState();
    var amount = Number(value) || 0;
    if (state.resources < amount) return false;

    var newResources = state.resources - amount;
    if (_dispatch) {
      _dispatch(setResources(newResources));
    }
    state.resources = newResources;
    checkTutorialAfterUpdate();
    return true;
  }

  function incGold(value) {
    var state = getState();
    var amount = (Number(value) || 0) * (state.goldMulti || 1);
    var availableSpace = state.maxGold - state.gold;
    var newGold = amount < availableSpace ? state.gold + amount : state.maxGold;

    if (_dispatch) {
      _dispatch(setGold(newGold));
    }
    state.gold = newGold;
    checkTutorialAfterUpdate();
    return state.gold;
  }

  function decGold(value) {
    var state = getState();
    var amount = Number(value) || 0;
    if (state.gold < amount) return false;

    var newGold = state.gold - amount;
    if (_dispatch) {
      _dispatch(setGold(newGold));
    }
    state.gold = newGold;
    checkTutorialAfterUpdate();
    return true;
  }

  function incrRes(multi) {
    var state = getState();
    if (state.gameStats) {
      if (_dispatch) _dispatch(incrementClicks());
      state.gameStats.clicks = (state.gameStats.clicks || 0) + 1;
    }
    incResources(Number(multi) || 1);
  }

  return {
    bindState,
    bindStore,
    incResources,
    decResources,
    incGold,
    decGold,
    incrRes,
    getState,
  };
}

export default EconomyServiceFactory;
