/**
 * Economy service: resources and gold (increment, decrement).
 * Reads current economy from the Redux store; all updates dispatch fine-grained slice actions.
 * No mutable state held here — Redux is the single source of truth.
 */
import { setResources, setGold, setIncr, setMaxResources, setMaxGold } from '../store/slices/economySlice.ts';
import { incrementClicks } from '../store/slices/gameStatsSlice.ts';
import type { AppStore } from '../store/index.ts';
import type { GameUiServiceInstance } from './gameUi.service.ts';

// setMaxResources and setMaxGold are imported but currently unused in this file
// (used in building.service.ts); keeping import to avoid unused-import warnings if needed
void setMaxResources;
void setMaxGold;

function EconomyServiceFactory(GameUiService: GameUiServiceInstance, store: AppStore) {
  function getEconomy() {
    const s = store.getState();
    return s.economy;
  }

  function checkTutorialAfterUpdate(): void {
    if (GameUiService && typeof GameUiService.checkTutorialProgress === 'function') {
      const s = store.getState();
      GameUiService.checkTutorialProgress({
        resources: s.economy.resources,
        gold: s.economy.gold,
        tutorialStepIndex: s.tutorial.tutorialStepIndex,
      });
    }
  }

  function incResources(value: number): number {
    const { resources, maxResources } = getEconomy();
    const amount = Number(value) || 0;
    const newResources = amount < maxResources - resources ? resources + amount : maxResources;
    store.dispatch(setResources(newResources));
    checkTutorialAfterUpdate();
    return newResources;
  }

  function decResources(value: number): boolean {
    const { resources } = getEconomy();
    const amount = Number(value) || 0;
    if (resources < amount) return false;
    store.dispatch(setResources(resources - amount));
    checkTutorialAfterUpdate();
    return true;
  }

  function incGold(value: number): number {
    const { gold, maxGold, goldMulti } = getEconomy();
    const amount = (Number(value) || 0) * (goldMulti || 1);
    const newGold = amount < maxGold - gold ? gold + amount : maxGold;
    store.dispatch(setGold(newGold));
    checkTutorialAfterUpdate();
    return newGold;
  }

  function decGold(value: number): boolean {
    const { gold } = getEconomy();
    const amount = Number(value) || 0;
    if (gold < amount) return false;
    store.dispatch(setGold(gold - amount));
    checkTutorialAfterUpdate();
    return true;
  }

  function incrRes(multi?: number): void {
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

export type EconomyServiceInstance = ReturnType<typeof EconomyServiceFactory>;

export default EconomyServiceFactory;
