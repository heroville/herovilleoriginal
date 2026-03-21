/**
 * Building and blueprint upgrades.
 * Reads state from the Redux store; dispatches slice actions after mutations.
 * No GameStateService — Redux is the single source of truth.
 */
import { getFlatState, dispatchBuildings, dispatchDungeons, dispatchProduction, dispatchJobs, dispatchUi, dispatchConfig } from './stateHelpers.js';
import { setMaxResources, setMaxGold } from '../store/slices/economySlice.js';
import {
  BUILDING_TENT,
  BUILDING_STOCKPILE,
  BUILDING_MARKET,
  BUILDING_BLACKSMITH,
  BUILDING_TAVERN,
  BUILDING_ALCHEMIST,
  BUILDING_DUNGEONS,
  BUILDING_ACADEMY,
  BUILDING_WORK_HUT,
  MAX_DUNGEON_COUNT,
} from '../constants/gameConstants.js';

function BuildingServiceFactory(
  store,
  GameUiService,
  DungeonService,
  ProductionService
) {
  function incrBuilding(state, actions, building) {
    if (!building || building.id == null) return;
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
    if (bid === BUILDING_TENT && state.buildings[BUILDING_STOCKPILE].enabled === false) {
      state.buildings[BUILDING_STOCKPILE].enabled = true;
      state.buildings[BUILDING_DUNGEONS].enabled = true;
      actions.activateDungeon();
      actions.createMonster(1);
    }
    switch (bid) {
      case BUILDING_TENT: {
        if (actions.openHeroDialog) actions.openHeroDialog();
        state.heroEnabled = true;
        if (state.buildings[BUILDING_TENT].count === 5) actions.activateBlueprint(3);
        if (state.tutorialStepIndex === 2) actions.nextTutorial();
        break;
      }
      case BUILDING_STOCKPILE: {
        state.maxResources = stateBuilding.cost + Math.floor(stateBuilding.cost / 10);
        state.maxGold = Math.floor(stateBuilding.cost / 10);
        if (state.buildings[BUILDING_MARKET].count === 0) {
          state.buildings[BUILDING_MARKET].enabled = true;
          state.prodEnabled = true;
          state.jobs[1].enabled = true;
        } else if (state.buildings[BUILDING_TAVERN].count === 0) {
          actions.activateBlueprint(2);
        }
        if (state.tutorialStepIndex === 5) actions.nextTutorial();
        break;
      }
      case BUILDING_MARKET: {
        const bp0 = state.blueprints && state.blueprints[0];
        const notYetPurchased = bp0 && bp0.cost > 0;
        if (notYetPurchased && !state.buildings[BUILDING_BLACKSMITH].enabled) {
          state.blueprints[0].enabled = true;
          state.buildings[BUILDING_MARKET].enabled = false;
          if (state.tutorialStepIndex === 12) actions.nextTutorial();
        }
        break;
      }
      case BUILDING_BLACKSMITH: {
        if (state.buildings[BUILDING_BLACKSMITH].count + 1 < state.weapons.length) {
          state.weapons[state.buildings[BUILDING_BLACKSMITH].count].enabled = true;
          if (state.tutorialStepIndex === 14) actions.nextTutorial();
        } else {
          state.weapons[state.buildings[BUILDING_BLACKSMITH].count].enabled = true;
          state.buildings[BUILDING_BLACKSMITH].enabled = false;
        }
        if (state.buildings[BUILDING_BLACKSMITH].count % 3 === 0) state.jobs[2].limit++;
        state.jobs[2].enabled = true;
        break;
      }
      case BUILDING_TAVERN: {
        state.buildings[BUILDING_TAVERN].enabled = false;
        state.upgEnabled = true;
        if (state.buildings[BUILDING_WORK_HUT]) state.buildings[BUILDING_WORK_HUT].enabled = true;
        if (state.tutorialStepIndex === 18) actions.nextTutorial();
        break;
      }
      case BUILDING_ALCHEMIST: {
        if (state.buildings[BUILDING_ALCHEMIST].count + 1 < state.potions.length) {
          state.potions[state.buildings[BUILDING_ALCHEMIST].count - 1].enabled = true;
        } else {
          state.potions[state.buildings[BUILDING_ALCHEMIST].count].enabled = true;
          state.buildings[BUILDING_ALCHEMIST].enabled = false;
        }
        if (state.buildings[BUILDING_ALCHEMIST].count % 3 === 0) state.jobs[1].limit++;
        break;
      }
      case BUILDING_DUNGEONS: {
        if (state.dungeons.length < MAX_DUNGEON_COUNT) {
          actions.activateDungeon();
          if (state.tutorialStepIndex === 10) actions.nextTutorial();
        } else {
          actions.activateDungeon();
          actions.activateBlueprint(4);
          state.buildings[BUILDING_DUNGEONS].enabled = false;
        }
        break;
      }
      case BUILDING_ACADEMY:
        state.buildings[BUILDING_ACADEMY].enabled = false;
      // falls through
      case BUILDING_WORK_HUT: {
        if (state.tutorialStepIndex === 21) actions.nextTutorial();
        if (actions.openWorkerDialog) actions.openWorkerDialog();
        break;
      }
    }
    // Fallback: enable Blacksmith Blueprint when improving Market
    if (
      state.blueprints &&
      state.blueprints[0] &&
      (bid === BUILDING_MARKET || (building.name && building.name.toLowerCase() === 'market'))
    ) {
      const bp = state.blueprints[0];
      const notYetPurchased = bp.cost > 0;
      if (notYetPurchased && !state.buildings[BUILDING_BLACKSMITH].enabled) {
        state.blueprints[0].enabled = true;
        state.buildings[BUILDING_MARKET].enabled = false;
      }
    }
    if (
      state.buildings[BUILDING_WORK_HUT] &&
      (bid === BUILDING_TAVERN || (building.name && building.name.toLowerCase() === 'tavern'))
    ) {
      state.buildings[BUILDING_WORK_HUT].enabled = true;
    }
    dispatchBuildings(store, state);
    dispatchUi(store, state);
    dispatchProduction(store, state);
    dispatchJobs(store, state);
    // Dispatch economy fields if they were mutated (e.g. BUILDING_STOCKPILE changes maxResources/maxGold)
    if (state.maxResources !== undefined) store.dispatch(setMaxResources(state.maxResources));
    if (state.maxGold !== undefined) store.dispatch(setMaxGold(state.maxGold));
  }

  function incrBlueprint(state, actions, blueprint) {
    if (!blueprint) return;
    if (!actions.decGold(blueprint.cost)) {
      actions.showError('You do not have enough Gold');
      return;
    }
    // Do NOT mutate blueprint directly — it may be a frozen Redux state object.
    // Mutate only stateBlueprint (from fresh flat state).
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
          state.beastEnabled = true;
          break;
      }
    }
    dispatchBuildings(store, state);
    dispatchProduction(store, state);
    dispatchUi(store, state);
  }

  /** Build state and actions for incrBuilding/incrBlueprint. */
  function buildStateAndActions(economyActions) {
    const state = getFlatState(store);
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
    buildStateAndActions,
    incrBuilding,
    incrBlueprint,
  };
}

export default BuildingServiceFactory;
