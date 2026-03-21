/**
 * Economy service: resources and gold (increment, decrement).
 * Reads current economy from the Redux store; all updates dispatch fine-grained slice actions.
 * No mutable state held here — Redux is the single source of truth.
 */
import { setResources, setGold, setIncr, setMaxResources, setMaxGold } from '../store/slices/economySlice.js';
import { incrementClicks } from '../store/slices/gameStatsSlice.js';

function EconomyServiceFactory(GameUiService, store) {
  function getEconomy() {
    const s = store.getState();
    return s.economy;
  }

  function checkTutorialAfterUpdate() {
    if (GameUiService && typeof GameUiService.checkTutorialProgress === 'function') {
      const s = store.getState();
      GameUiService.checkTutorialProgress({
        resources: s.economy.resources,
        gold: s.economy.gold,
        tutorialStepIndex: s.tutorial.tutorialStepIndex,
      });
    }
  }

  function incResources(value) {
    const { resources, maxResources } = getEconomy();
    const amount = Number(value) || 0;
    const newResources = amount < maxResources - resources ? resources + amount : maxResources;
    store.dispatch(setResources(newResources));
    checkTutorialAfterUpdate();
    return newResources;
  }

  function decResources(value) {
    const { resources } = getEconomy();
    const amount = Number(value) || 0;
    if (resources < amount) return false;
    store.dispatch(setResources(resources - amount));
    checkTutorialAfterUpdate();
    return true;
  }

  function incGold(value) {
    const { gold, maxGold, goldMulti } = getEconomy();
    const amount = (Number(value) || 0) * (goldMulti || 1);
    const newGold = amount < maxGold - gold ? gold + amount : maxGold;
    store.dispatch(setGold(newGold));
    checkTutorialAfterUpdate();
    return newGold;
  }

  function decGold(value) {
    const { gold } = getEconomy();
    const amount = Number(value) || 0;
    if (gold < amount) return false;
    store.dispatch(setGold(gold - amount));
    checkTutorialAfterUpdate();
    return true;
  }

  function incrRes(multi) {
    store.dispatch(incrementClicks());
    incResources(Number(multi) || 1);
  }

  return {
    incResources,
    decResources,
    incGold,
    decGold,
    incrRes,
  };
}

export default EconomyServiceFactory;
