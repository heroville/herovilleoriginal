/**
 * Building and blueprint upgrades.
 * Uses explicit state (data) and actions (callbacks) for testability; no scope.
 * When store is bound via bindStore(store), dispatches REPLACE_STATE after incrBuilding/incrBlueprint
 * so the Redux store is updated from GameStateService.getState().
 *
 * @typedef BuildingState
 * @property {Array} buildings
 * @property {Array} jobs
 * @property {Array} upgrades
 * @property {Array} blueprints
 * @property {Array} weapons
 * @property {Array} potions
 * @property {Array} dungeons
 * @property {number} panelNumber
 * @property {boolean} heroEnabled (get/set)
 * @property {boolean} prodEnabled (get/set)
 * @property {boolean} upgEnabled (get/set)
 * @property {number} maxResources (get/set)
 * @property {number} maxGold (get/set)
 * @property {boolean} bestiary (get/set)
 * @property {boolean} beastEnabled (get/set)
 *
 * @typedef BuildingActions
 * @property {function(number): boolean} decResources
 * @property {function(number): boolean} decGold
 * @property {function(string): void} showError
 * @property {function(): void} nextTutorial
 * @property {function(): void} activateDungeon
 * @property {function(number): void} createMonster
 * @property {function(number): void} activateBlueprint
 * @property {function(): void} [openHeroDialog]
 * @property {function(): void} [openWorkerDialog]
 */
import { REPLACE_STATE } from '../store/sliceState.js';


function BuildingServiceFactory(
  GameStateService,
  GameUiService,
  DungeonService,
  ProductionService
) {
  var _dispatch = null;

  /** Binds the Redux store; after incrBuilding/incrBlueprint we dispatch REPLACE_STATE so the store stays in sync. */
  function bindStore(store) {
    if (store) _dispatch = store.dispatch;
  }

  function syncStoreIfBound() {
    if (_dispatch) {
      const flat = GameStateService.getState();
      _dispatch({ type: REPLACE_STATE, payload: JSON.parse(JSON.stringify(flat)) });
    }
  }

  function incrBuilding(state, actions, building) {
    if (!actions.decResources(building.cost)) {
      actions.showError('You do not have enough Resources');
      return;
    }
    const bid = Number(building.id);
    if (Number.isNaN(bid) || bid < 0 || !state.buildings[bid]) return;
    const stateBuilding = state.buildings[bid];
    stateBuilding.count++;
    stateBuilding.cost = Math.ceil(
      building.cost + Math.pow(stateBuilding.count + 1, building.multiplier)
    );
    if (bid === 0 && state.buildings[1].enabled === false) {
      state.buildings[1].enabled = true;
      state.buildings[6].enabled = true;
      actions.activateDungeon();
      actions.createMonster(1);
    }
    switch (bid) {
      case 0: {
        if (actions.openHeroDialog) actions.openHeroDialog();
        state.heroEnabled = true; /* unlock Hero tab when first Tent built */
        if (state.buildings[0].count === 5) actions.activateBlueprint(3);
        if (state.tutorialStepIndex === 2) actions.nextTutorial();
        break;
      }
      case 1: {
        // Use updated cost (next upgrade cost) so capacity allows affording the next Stockpile upgrade
        state.maxResources = stateBuilding.cost + Math.floor(stateBuilding.cost / 10);
        state.maxGold = Math.floor(stateBuilding.cost / 10);
        if (state.buildings[2].count === 0) {
          state.buildings[2].enabled = true;
          state.prodEnabled = true; /* unlock Production tab when Stockpile built */
          state.jobs[1].enabled = true;
        } else if (state.buildings[4].count === 0) {
          actions.activateBlueprint(2);
        }
        if (state.tutorialStepIndex === 5) actions.nextTutorial();
        break;
      }
      case 2: {
        const bp0 = state.blueprints && state.blueprints[0];
        const notYetPurchased = bp0 && bp0.cost > 0;
        if (notYetPurchased && !state.buildings[3].enabled) {
          state.blueprints[0].enabled = true;
          state.buildings[2].enabled = false;
          if (state.tutorialStepIndex === 12) actions.nextTutorial();
        }
        break;
      }
      case 3: {
        if (state.buildings[3].count + 1 < state.weapons.length) {
          state.weapons[state.buildings[3].count].enabled = true;
          if (state.tutorialStepIndex === 14) actions.nextTutorial();
        } else {
          state.weapons[state.buildings[3].count].enabled = true;
          state.buildings[3].enabled = false;
        }
        if (state.buildings[3].count % 3 === 0) state.jobs[2].limit++;
        state.jobs[2].enabled = true;
        break;
      }
      case 4: {
        state.buildings[4].enabled = false;
        state.upgEnabled = true; /* unlock Professions tab when Tavern built */
        if (state.buildings[9]) state.buildings[9].enabled = true;
        if (state.tutorialStepIndex === 18) actions.nextTutorial();
        break;
      }
      case 5: {
        if (state.buildings[5].count + 1 < state.potions.length) {
          state.potions[state.buildings[5].count - 1].enabled = true;
        } else {
          state.potions[state.buildings[5].count].enabled = true;
          state.buildings[5].enabled = false;
        }
        if (state.buildings[5].count % 3 === 0) state.jobs[1].limit++;
        break;
      }
      case 6: {
        if (state.dungeons.length < 14) {
          actions.activateDungeon();
          if (state.tutorialStepIndex === 10) actions.nextTutorial();
        } else {
          actions.activateDungeon();
          actions.activateBlueprint(4);
          state.buildings[6].enabled = false;
        }
        break;
      }
      case 7:
        state.buildings[7].enabled = false;
      // falls through
      case 9: {
        if (state.tutorialStepIndex === 21) actions.nextTutorial();
        if (actions.openWorkerDialog) actions.openWorkerDialog();
        break;
      }
    }
    // Fallback: enable Blacksmith Blueprint when improving Market (by id or name) only if not yet purchased
    if (
      state.blueprints &&
      state.blueprints[0] &&
      (bid === 2 || (building.name && building.name.toLowerCase() === 'market'))
    ) {
      const bp = state.blueprints[0];
      const notYetPurchased = bp.cost > 0;
      if (notYetPurchased && !state.buildings[3].enabled) {
        state.blueprints[0].enabled = true;
        state.buildings[2].enabled = false;
      }
    }
    if (
      state.buildings[9] &&
      (bid === 4 || (building.name && building.name.toLowerCase() === 'tavern'))
    ) {
      state.buildings[9].enabled = true;
    }
    syncStoreIfBound();
  }

  function incrBlueprint(state, actions, blueprint) {
    if (!actions.decGold(blueprint.cost)) {
      actions.showError('You do not have enough Gold');
      return;
    }
    blueprint.enabled = false;
    blueprint.cost = 0;
    var stateBlueprint = state.blueprints && state.blueprints[blueprint.id];
    if (stateBlueprint) {
      stateBlueprint.enabled = false;
      stateBlueprint.cost = 0;
    }
    if (blueprint.buildingID > 0) {
      state.buildings[blueprint.buildingID].enabled = true;
      if (state.tutorialStepIndex === 13) actions.nextTutorial();
    } else {
      switch (blueprint.buildingID) {
        case -1:
          break;
        case -2:
          state.bestiary = true;
          state.beastEnabled = true; /* unlock Bestiary tab */
          break;
      }
    }
    syncStoreIfBound();
  }

  /** Build state and actions for incrBuilding/incrBlueprint. Uses GameStateService, GameUiService, DungeonService, ProductionService (no scope). */
  function buildStateAndActions(economyActions) {
    const state = GameStateService.getState();
    const actions = {
      decResources: economyActions.decResources,
      decGold: economyActions.decGold,
      showError: (m) => GameUiService.showError(m),
      nextTutorial: () => GameUiService.nextTutorial(),
      activateDungeon: () => DungeonService.activateDungeon(),
      createMonster: (l) => DungeonService.createMonster(l),
      activateBlueprint: (v) => ProductionService.activateBlueprint(v),
      openHeroDialog: () => GameUiService.openHeroDialog(),
      openWorkerDialog: () => GameUiService.openWorkerDialog(),
    };
    return { state, actions };
  }

  return {
    bindStore,
    buildStateAndActions,
    incrBuilding,
    incrBlueprint,
  };
}

export default BuildingServiceFactory;
