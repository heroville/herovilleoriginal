/**
 * Production: potions, weapons, upgrades, blueprints.
 * When store is bound via bindStore(store), dispatches REPLACE_STATE after create, purchaseWeapon,
 * buyUpgrade, activateBlueprint and when async production (createPotion/createPotions/buyWeapon) completes.
 */
import { REPLACE_STATE } from '../store/sliceState.js';

const PROGRESS_SYNC_THROTTLE_MS = 500;

function ProductionServiceFactory(EconomyService, GameUiService) {
  var _dispatch = null;
  var _lastProgressSync = 0;

  function bindStore(store) {
    if (store) _dispatch = store.dispatch;
  }

  function syncStoreIfBound() {
    if (_dispatch) {
      const flat = EconomyService.getState();
      _dispatch({ type: REPLACE_STATE, payload: JSON.parse(JSON.stringify(flat)) });
    }
  }

  /** Throttled sync for progress ticks to avoid full clone every gameLoop ms. Always call syncStoreIfBound on completion. */
  function syncProgressIfNeeded() {
    const now = Date.now();
    if (now - _lastProgressSync >= PROGRESS_SYNC_THROTTLE_MS) {
      _lastProgressSync = now;
      syncStoreIfBound();
    }
  }

  function createPotion(button, start, heroID, onDone) {
    const s = EconomyService.getState();
    if (heroID !== 0) {
      heroID = heroID || -1;
    }
    if (s.potion.prodTime > start) {
      if (button) {
        s.potion.progress = (s.potion.prodTime - start).toString().toHHMMSS();
        syncProgressIfNeeded();
      } else if (heroID >= 0) {
        s.heroList[heroID].progress = (s.potion.prodTime - start).toString().toHHMMSS();
      }
      setTimeout(function () {
        createPotion(button, start + 1, heroID, onDone);
      }, s.gameLoop);
    } else {
      s.potion.working--;
      s.potion.count++;
      if (button) {
        s.potion.progress = 'Create Potion';
        if (onDone) onDone();
      } else if (heroID >= 0) {
        s.heroList[heroID].progress = 'Idle';
      }
      syncStoreIfBound();
    }
  }

  function createPotions(potionID, button, start, heroID, onDone) {
    const s = EconomyService.getState();
    if (heroID !== 0) {
      heroID = heroID || -1;
    }
    const acc = s.potions[potionID];
    if (acc.prodTime > start) {
      if (button) {
        acc.progress = (acc.prodTime - start).toString().toHHMMSS();
        syncProgressIfNeeded();
      } else if (heroID >= 0) {
        s.heroList[heroID].progress = (acc.prodTime - start).toString().toHHMMSS();
      }
      setTimeout(function () {
        createPotions(potionID, button, start + 1, heroID, onDone);
      }, s.gameLoop);
    } else {
      acc.count++;
      acc.working--;
      if (button) {
        acc.progress = 'Create ' + acc.name;
        if (onDone) onDone();
      } else if (heroID >= 0) {
        s.heroList[heroID].progress = 'Idle';
      }
      syncStoreIfBound();
    }
  }

  function buyWeapon(weaponID, button, start, heroID, onDone) {
    const s = EconomyService.getState();
    if (heroID !== 0) {
      heroID = heroID || -1;
    }
    const weapon = s.weapons[weaponID];
    if (weapon.prodTime > start) {
      if (button) {
        weapon.progress = (weapon.prodTime - start).toString().toHHMMSS();
        syncProgressIfNeeded();
      } else if (heroID >= 0) {
        s.heroList[heroID].progress = (weapon.prodTime - start).toString().toHHMMSS();
      }
      setTimeout(function () {
        buyWeapon(weaponID, button, start + 1, heroID, onDone);
      }, s.gameLoop);
    } else {
      weapon.count++;
      weapon.working--;
      if (button) {
        weapon.progress = 'Create ' + weapon.name;
        if (onDone) onDone();
      } else if (heroID >= 0) {
        s.heroList[heroID].progress = 'Idle';
      }
      syncStoreIfBound();
    }
  }

  function buyUpgrade(upgradeID) {
    const s = EconomyService.getState();
    if (s.upgrades[upgradeID].price <= s.gold) {
      EconomyService.decGold(s.upgrades[upgradeID].price);
      s.upgrades[upgradeID].enabled = false;
      s.upgrades[upgradeID].purchased = true;
      switch (upgradeID) {
        case 0: {
          s.incr++;
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
          s.incr = s.incr * 2;
          s.upgrades[upgradeID + 1].enabled = true;
          break;
        }
        case 10: {
          s.incr = s.incr * 2;
          break;
        }
      }
    } else {
      GameUiService.showError('You do not have enough Gold');
    }
  }

  function activateBlueprint(value) {
    const s = EconomyService.getState();
    if (!s.blueprints[value].enabled && s.blueprints[value].cost !== 0) {
      s.blueprints[value].enabled = true;
      syncStoreIfBound();
    }
  }

  /**
   * Start potion/potions production (entry point). Uses explicit state and actions.
   * @param {{ potion: object, potions: array, resources: number, panelNumber: number }} state
   * @param {{ decResources: function(number): boolean, showError: function(string), nextTutorial: function(), disablePotionButton: function(number), startCreatePotion: function(), startCreatePotions: function(number) }} actions
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
    syncStoreIfBound();
  }

  /**
   * Start weapon production (entry point). Uses explicit state and actions.
   * @param {{ weapons: array, resources: number, buildings: array, upgrades: array, gameStats: object, panelNumber: number }} state
   * @param {{ decResources: function(number): boolean, showError: function(string), nextTutorial: function(), disableWeaponButton: function(number), startBuyWeapon: function(number) }} actions
   */
  function purchaseWeapon(state, actions, weaponID) {
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
    syncStoreIfBound();
  }

  return {
    bindStore,
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
