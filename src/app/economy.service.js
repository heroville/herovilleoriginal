const appModule = require('./app.module');
const app = appModule.default || appModule;

function ensureState(state) {
  if (!state) {
    throw new Error('EconomyService requires a bound state before use.');
  }
  return state;
}

function EconomyServiceFactory() {
  let boundState = null;

  function getState() {
    return ensureState(boundState);
  }

  function bindState(state) {
    boundState = state;
    return boundState;
  }

  function incResources(value) {
    const state = getState();
    const amount = Number(value) || 0;
    const availableSpace = state.maxResources - state.resources;
    if (amount < availableSpace) {
      state.resources += amount;
    }
    else {
      state.resources = state.maxResources;
    }
    return state.resources;
  }

  function decResources(value) {
    const state = getState();
    const amount = Number(value) || 0;
    if (state.resources >= amount) {
      state.resources -= amount;
      return true;
    }
    return false;
  }

  function incGold(value) {
    const state = getState();
    const amount = (Number(value) || 0) * (state.goldMulti || 1);
    const availableSpace = state.maxGold - state.gold;
    if (amount < availableSpace) {
      state.gold += amount;
    }
    else {
      state.gold = state.maxGold;
    }
    return state.gold;
  }

  function decGold(value) {
    const state = getState();
    const amount = Number(value) || 0;
    if (state.gold >= amount) {
      state.gold -= amount;
      return true;
    }
    return false;
  }

  return {
    bindState,
    incResources,
    decResources,
    incGold,
    decGold,
    getState,
  };
}

app.factory('EconomyService', EconomyServiceFactory);

module.exports = EconomyServiceFactory;
module.exports.default = EconomyServiceFactory;
