/**
 * Production: potions, weapons, upgrades, blueprints.
 * Reads state from the Redux store; dispatches production/ui/upgrades slices after mutations.
 * No GameStateService — Redux is the single source of truth.
 */
import { getFlatState, dispatchProduction, dispatchUpgrades, dispatchUi, dispatchHeroes, dispatchGameStats } from './stateHelpers.js';
import { formatSeconds } from './util.service.js';
import { PROGRESS_SYNC_THROTTLE_MS } from '../constants/gameConstants.js';
import { setIncr } from '../store/slices/economySlice.js';

function ProductionServiceFactory(EconomyService, GameUiService, store) {
  var _lastProgressSync = 0;

  function syncProgressIfNeeded() {
    const now = Date.now();
    if (now - _lastProgressSync >= PROGRESS_SYNC_THROTTLE_MS) {
      _lastProgressSync = now;
      const s = getFlatState(store);
      dispatchProduction(store, s);
      dispatchHeroes(store, s);
    }
  }

  function createPotion(button, start, heroID, onDone) {
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

  function createPotions(potionID, button, start, heroID, onDone) {
    const s = getFlatState(store);
    if (heroID !== 0) {
      heroID = heroID || -1;
    }
    const acc = s.potions[potionID];
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
      s2.potions[potionID].working--;
      if (button) {
        s2.potions[potionID].progress = 'Create ' + s2.potions[potionID].name;
        if (onDone) onDone();
      } else if (heroID >= 0) {
        s2.heroList[heroID].progress = 'Idle';
      }
      dispatchProduction(store, s2);
      dispatchHeroes(store, s2);
    }
  }

  function buyWeapon(weaponID, button, start, heroID, onDone) {
    const s = getFlatState(store);
    if (heroID !== 0) {
      heroID = heroID || -1;
    }
    const weapon = s.weapons[weaponID];
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
      s2.weapons[weaponID].working--;
      if (button) {
        s2.weapons[weaponID].progress = 'Create ' + s2.weapons[weaponID].name;
        if (onDone) onDone();
      } else if (heroID >= 0) {
        s2.heroList[heroID].progress = 'Idle';
      }
      dispatchProduction(store, s2);
      dispatchHeroes(store, s2);
    }
  }

  function buyUpgrade(upgradeID) {
    const s = getFlatState(store);
    if (upgradeID == null || upgradeID < 0 || upgradeID >= s.upgrades.length) return;
    if (!s.upgrades[upgradeID]) return;
    if (s.upgrades[upgradeID].price <= s.gold) {
      EconomyService.decGold(s.upgrades[upgradeID].price);
      s.upgrades[upgradeID].enabled = false;
      s.upgrades[upgradeID].purchased = true;
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
          s.buildings[0].tier++;
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

  function activateBlueprint(value) {
    const s = getFlatState(store);
    if (!s.blueprints[value].enabled && s.blueprints[value].cost !== 0) {
      s.blueprints[value].enabled = true;
      dispatchProduction(store, s);
    }
  }

  /**
   * Start potion/potions production (entry point). Uses explicit state and actions.
   */
  function create(state, actions, itemID) {
    if (itemID === -1) {
      if (state.potion.count + state.potion.working >= state.potion.maxCount) return;
      if (!actions.decResources(state.potion.cost)) {
        actions.showError('You do not have enough Resources.');
        return;
      }
      if (state.tutorialStepIndex === 6) actions.nextTutorial();
      if (actions.disablePotionButton) actions.disablePotionButton(-1);
      state.potion.working++;
      actions.startCreatePotion();
    } else {
      if (
        state.potions[itemID].count + state.potions[itemID].working >=
        state.potions[itemID].maxCount
      )
        return;
      if (!actions.decResources(state.potions[itemID].cost)) {
        actions.showError('You do not have enough Resources.');
        return;
      }
      if (actions.disablePotionButton) actions.disablePotionButton(itemID);
      state.potions[itemID].working++;
      actions.startCreatePotions(itemID);
    }
    const s = getFlatState(store);
    dispatchProduction(store, { ...s, potion: state.potion, potions: state.potions });
  }

  /**
   * Start weapon production (entry point). Uses explicit state and actions.
   */
  function purchaseWeapon(state, actions, weaponID) {
    if (weaponID == null || weaponID < 0 || !state.weapons || weaponID >= state.weapons.length) return;
    const w = state.weapons[weaponID];
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
    if (!(state.gameStats.weaponsManual[weaponID] >= 0))
      state.gameStats.weaponsManual[weaponID] = 0;
    state.gameStats.weaponsManual[weaponID]++;
    actions.startBuyWeapon(weaponID);
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

export default ProductionServiceFactory;
