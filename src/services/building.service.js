/**
 * Building and blueprint upgrades.
 * Uses explicit state (data) and actions (callbacks) for testability; no scope.
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

const DEFAULT_JOBS = [
    { id: 0, name: "Gather", current: 0, limit: 100, enabled: true, description: "A Gathering hero will collect resources every second." },
    { id: 1, name: "Apothecary", current: 0, limit: 1, enabled: false, description: "An Apothecary will make potions." },
    { id: 2, name: "Smith", current: 0, limit: 1, enabled: false, description: "A Smith will produce weapons." }
];

const DEFAULT_UPGRADES = [
    { id: 0, name: 'Bonus Resources I', price: 1, enabled: true },
    { id: 1, name: 'Save Point', price: 3, enabled: false },
    { id: 2, name: 'Bonus Resources II', price: 5, enabled: false },
    { id: 3, name: 'Bonus Resources III', price: 20, enabled: false },
    { id: 4, name: 'Bonus Resources IV', price: 80, enabled: false },
    { id: 5, name: 'Bonus Resources V', price: 350, enabled: false },
    { id: 6, name: 'Bonus Resources VI', price: 1000, enabled: false },
    { id: 7, name: 'Bonus Resources VII', price: 4000, enabled: false },
    { id: 8, name: 'Bonus Resources VIII', price: 15000, enabled: false },
    { id: 9, name: 'Bonus Resources IX', price: 45000, enabled: false },
    { id: 10, name: 'Bonus Resources X', price: 100000, enabled: false },
    { id: 11, name: 'Potion Capacity', price: 100, enabled: false },
    { id: 12, name: 'Potion Capacity II', price: 500, enabled: false },
    { id: 13, name: 'Potion Capacity III', price: 2000, enabled: false }
];

function BuildingServiceFactory(GameStateService, GameUiService, DungeonService, ProductionService) {

    function incrBuilding(state, actions, building) {
        if (!actions.decResources(building.cost)) {
            actions.showError("You do not have enough Resources");
            return;
        }
        building.count++;
        building.cost = Math.ceil(building.cost + Math.pow((building.count + 1), building.multiplier));
        if (building.id === 0 && state.buildings[1].enabled === false) {
            state.buildings[1].enabled = true;
            state.buildings[6].enabled = true;
            actions.activateDungeon();
            actions.createMonster(1);
        }
        switch (building.id) {
            case 0: {
                if (actions.openHeroDialog) actions.openHeroDialog();
                state.heroEnabled = false;
                if (building.count === 5) actions.activateBlueprint(3);
                if (state.panelNumber === 3) actions.nextTutorial();
                break;
            }
            case 1: {
                state.maxResources = building.cost + Math.floor(building.cost / 10);
                state.maxGold = Math.floor(building.cost / 10);
                if (state.buildings[2].count === 0) {
                    state.buildings[2].enabled = true;
                    state.prodEnabled = false;
                    state.jobs[1].enabled = true;
                } else if (state.buildings[4].count === 0) {
                    actions.activateBlueprint(2);
                }
                if (state.panelNumber === 6) actions.nextTutorial();
                break;
            }
            case 2: {
                if (!state.buildings[3].enabled) {
                    state.blueprints[0].enabled = true;
                    state.buildings[2].enabled = false;
                    if (state.panelNumber === 13) actions.nextTutorial();
                }
                break;
            }
            case 3: {
                if (state.buildings[3].count + 1 < state.weapons.length) {
                    state.weapons[state.buildings[3].count].enabled = true;
                    if (state.panelNumber === 15) actions.nextTutorial();
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
                state.upgEnabled = false;
                state.buildings[9].enabled = true;
                if (state.panelNumber === 19) actions.nextTutorial();
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
                    if (state.panelNumber === 11) actions.nextTutorial();
                } else {
                    actions.activateDungeon();
                    actions.activateBlueprint(4);
                    state.buildings[6].enabled = false;
                }
                break;
            }
            case 7:
                state.buildings[7].enabled = false;
            case 9: {
                if (actions.openWorkerDialog) actions.openWorkerDialog();
                break;
            }
        }
    }

    function incrBlueprint(state, actions, blueprint) {
        if (!actions.decGold(blueprint.cost)) {
            actions.showError("You do not have enough Gold");
            return;
        }
        blueprint.enabled = false;
        if (blueprint.buildingID > 0) {
            state.buildings[blueprint.buildingID].enabled = true;
            blueprint.cost = 0;
            if (state.panelNumber === 14) actions.nextTutorial();
        } else {
            switch (blueprint.buildingID) {
                case -1:
                    break;
                case -2:
                    state.bestiary = true;
                    state.beastEnabled = false;
                    break;
            }
        }
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
            openWorkerDialog: () => GameUiService.openWorkerDialog()
        };
        return { state, actions };
    }

    return {
        buildStateAndActions,
        incrBuilding,
        incrBlueprint
    };
}

export default BuildingServiceFactory;
