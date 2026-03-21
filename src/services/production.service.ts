/**
 * Production: potions, weapons, upgrades, blueprints.
 * Reads state from the Redux store; dispatches production/ui/upgrades slices after mutations.
 * No GameStateService — Redux is the single source of truth.
 */
import { getFlatState, dispatchProduction, dispatchUpgrades, dispatchUi, dispatchHeroes, dispatchGameStats } from './stateHelpers.ts';
import { formatSeconds } from './util.service.ts';
import { PROGRESS_SYNC_THROTTLE_MS } from '../constants/gameConstants.ts';
import { setIncr } from '../store/slices/economySlice.ts';
import type { AppStore } from '../store/index.ts';
import type { FlatGameState, EconomyServiceType } from '../types/index.ts';
import type { GameUiServiceInstance } from './gameUi.service.ts';

interface ProductionActions {
  decResources(amount: number): boolean;
  showError(msg: string): void;
  nextTutorial(): void;
  disablePotionButton?(id: number): void;
  startCreatePotion?(): void;
  startCreatePotions?(id: number): void;
  disableWeaponButton?(id: number): void;
  startBuyWeapon?(id: number): void;
}

function ProductionServiceFactory(
  EconomyService: EconomyServiceType,
  GameUiService: GameUiServiceInstance,
  store: AppStore
) {
  let _lastProgressSync = 0;

  function syncProgressIfNeeded(): void {
    const now = Date.now();
    if (now - _lastProgressSync >= PROGRESS_SYNC_THROTTLE_MS) {
      _lastProgressSync = now;
      const s = getFlatState(store);
      dispatchProduction(store, s);
      dispatchHeroes(store, s);
    }
  }

  function createPotion(button: boolean, start: number, heroID: number, onDone?: () => void): void {
    const s = getFlatState(store);
    if (heroID !== 0) {
      heroID = heroID || -1;
    }
    if (s.potion.prodTime > start) {
      if (button) {
        s.potion.progress = formatSeconds(s.potion.prodTime - start);
        syncProgressIfNeeded();
      } else if (heroID >= 0) {
        s.heroList[heroID].progress = formatSeconds(s.potion.prodTime - start);
        syncProgressIfNeeded();
      }
      const gameLoop = store.getState().config.gameLoop;
      setTimeout(function () {
        createPotion(button, start + 1, heroID, onDone);
      }, gameLoop);
    } else {
      const s2 = getFlatState(store);
      s2.potion.working--;
      s2.potion.count++;
      if (button) {
        s2.potion.progress = 'Create Potion';
        if (onDone) onDone();
      } else if (heroID >= 0) {
        s2.heroList[heroID].progress = 'Idle';
      }
      dispatchProduction(store, s2);
      dispatchHeroes(store, s2);
    }
  }

  function createPotions(potionID: number, button: boolean, start: number, heroID: number, onDone?: () => void): void {
    const s = getFlatState(store);
    if (heroID !== 0) {
      heroID = heroID || -1;
    }
    const acc = s.potions[potionID] as FlatGameState['potions'][number] & { prodTime: number; progress: string };
    if (acc.prodTime > start) {
      if (button) {
        acc.progress = formatSeconds(acc.prodTime - start);
        syncProgressIfNeeded();
      } else if (heroID >= 0) {
        s.heroList[heroID].progress = formatSeconds(acc.prodTime - start);
        syncProgressIfNeeded();
      }
      const gameLoop = store.getState().config.gameLoop;
      setTimeout(function () {
        createPotions(potionID, button, start + 1, heroID, onDone);
      }, gameLoop);
    } else {
      const s2 = getFlatState(store);
      s2.potions[potionID].count++;
      (s2.potions[potionID] as FlatGameState['potions'][number] & { working: number }).working--;
      if (button) {
        (s2.potions[potionID] as FlatGameState['potions'][number] & { progress: string }).progress =
          'Create ' + s2.potions[potionID].name;
        if (onDone) onDone();
      } else if (heroID >= 0) {
        s2.heroList[heroID].progress = 'Idle';
      }
      dispatchProduction(store, s2);
      dispatchHeroes(store, s2);
    }
  }

  function buyWeapon(weaponID: number, button: boolean, start: number, heroID: number, onDone?: () => void): void {
    const s = getFlatState(store);
    if (heroID !== 0) {
      heroID = heroID || -1;
    }
    const weapon = s.weapons[weaponID] as FlatGameState['weapons'][number] & { prodTime: number; progress: string; working: number };
    if (weapon.prodTime > start) {
      if (button) {
        weapon.progress = formatSeconds(weapon.prodTime - start);
        syncProgressIfNeeded();
      } else if (heroID >= 0) {
        s.heroList[heroID].progress = formatSeconds(weapon.prodTime - start);
        syncProgressIfNeeded();
      }
      const gameLoop = store.getState().config.gameLoop;
      setTimeout(function () {
        buyWeapon(weaponID, button, start + 1, heroID, onDone);
      }, gameLoop);
    } else {
      const s2 = getFlatState(store);
      s2.weapons[weaponID].count++;
      (s2.weapons[weaponID] as FlatGameState['weapons'][number] & { working: number }).working--;
      if (button) {
        (s2.weapons[weaponID] as FlatGameState['weapons'][number] & { progress: string }).progress =
          'Create ' + s2.weapons[weaponID].name;
        if (onDone) onDone();
      } else if (heroID >= 0) {
        s2.heroList[heroID].progress = 'Idle';
      }
      dispatchProduction(store, s2);
      dispatchHeroes(store, s2);
    }
  }

  function buyUpgrade(upgradeID: number): void {
    const s = getFlatState(store);
    if (upgradeID == null || upgradeID < 0 || upgradeID >= s.upgrades.length) return;
    if (!s.upgrades[upgradeID]) return;
    if (s.upgrades[upgradeID].price <= s.gold) {
      EconomyService.decGold(s.upgrades[upgradeID].price);
      s.upgrades[upgradeID].enabled = false;
      (s.upgrades[upgradeID] as FlatGameState['upgrades'][number] & { purchased?: boolean }).purchased = true;
      switch (upgradeID) {
        case 0: {
          store.dispatch(setIncr(s.incr + 1));
          if (s.tutorialStepIndex === 8) {
            GameUiService.nextTutorial();
          }
          s.upgrades[2].enabled = true;
          break;
        }
        case 1: {
          s.buildings[0].tier = (s.buildings[0].tier ?? 0) + 1;
          s.buildings[0].name = 'Campsite';
          s.restAmount += 3;
          if (s.tutorialStepIndex === 17) {
            GameUiService.nextTutorial();
          }
          break;
        }
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9: {
          store.dispatch(setIncr(s.incr * 2));
          s.upgrades[upgradeID + 1].enabled = true;
          break;
        }
        case 10: {
          store.dispatch(setIncr(s.incr * 2));
          break;
        }
      }
      dispatchUpgrades(store, s);
      dispatchUi(store, s);
    } else {
      GameUiService.showError('You do not have enough Gold');
    }
  }

  function activateBlueprint(value: number): void {
    const s = getFlatState(store);
    if (!s.blueprints[value].enabled && s.blueprints[value].cost !== 0) {
      s.blueprints[value].enabled = true;
      dispatchProduction(store, s);
    }
  }

  /**
   * Start potion/potions production (entry point). Uses explicit state and actions.
   */
  function create(state: FlatGameState, actions: ProductionActions, itemID: number): void {
    if (itemID === -1) {
      if (state.potion.count + state.potion.working >= state.potion.maxCount) return;
      if (!actions.decResources(state.potion.cost)) {
        actions.showError('You do not have enough Resources.');
        return;
      }
      if (state.tutorialStepIndex === 6) actions.nextTutorial();
      if (actions.disablePotionButton) actions.disablePotionButton(-1);
      state.potion.working++;
      if (actions.startCreatePotion) actions.startCreatePotion();
    } else {
      if (
        state.potions[itemID].count + ((state.potions[itemID] as FlatGameState['potions'][number] & { working?: number }).working ?? 0) >=
        state.potions[itemID].maxCount
      )
        return;
      if (!actions.decResources(state.potions[itemID].cost)) {
        actions.showError('You do not have enough Resources.');
        return;
      }
      if (actions.disablePotionButton) actions.disablePotionButton(itemID);
      (state.potions[itemID] as FlatGameState['potions'][number] & { working: number }).working++;
      if (actions.startCreatePotions) actions.startCreatePotions(itemID);
    }
    const s = getFlatState(store);
    dispatchProduction(store, { ...s, potion: state.potion, potions: state.potions });
  }

  /**
   * Start weapon production (entry point). Uses explicit state and actions.
   */
  function purchaseWeapon(state: FlatGameState, actions: ProductionActions, weaponID: number): void {
    if (weaponID == null || weaponID < 0 || !state.weapons || weaponID >= state.weapons.length) return;
    const w = state.weapons[weaponID] as FlatGameState['weapons'][number] & { working: number; prodTime?: number };
    if (w.count + w.working >= w.maxCount) return;
    if (state.resources < w.cost) {
      actions.showError('You do not have enough Resources.');
      return;
    }
    if (actions.disableWeaponButton) actions.disableWeaponButton(weaponID);
    actions.decResources(w.cost);
    w.working++;
    if (state.tutorialStepIndex === 15) actions.nextTutorial();
    if (state.buildings[0].tier === 1) state.upgrades[1].enabled = true;
    const gStats = state.gameStats as FlatGameState['gameStats'] & { weaponsManual: number[] };
    if (!(gStats.weaponsManual[weaponID] >= 0))
      gStats.weaponsManual[weaponID] = 0;
    gStats.weaponsManual[weaponID]++;
    if (actions.startBuyWeapon) actions.startBuyWeapon(weaponID);
    const s = getFlatState(store);
    dispatchProduction(store, { ...s, weapons: state.weapons });
    dispatchUpgrades(store, { ...s, upgrades: state.upgrades });
    dispatchGameStats(store, { ...s, gameStats: state.gameStats });
  }

  return {
    createPotion,
    createPotions,
    buyWeapon,
    buyUpgrade,
    activateBlueprint,
    create,
    purchaseWeapon,
  };
}

export type ProductionServiceInstance = ReturnType<typeof ProductionServiceFactory>;

export default ProductionServiceFactory;
