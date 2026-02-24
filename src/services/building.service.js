/**
 * Building and blueprint upgrades. Mutates scope state; calls scope methods for UI (dialogs, tutorial, errors).
 */

function BuildingServiceFactory(EconomyService) {

    function incrBuilding(scope, building) {
        if (!EconomyService.decResources(building.cost)) {
            scope.showError("You do not have enough Resources");
            return;
        }
        building.count++;
        building.cost = Math.ceil(building.cost + Math.pow((building.count + 1), building.multiplier));
        if (building.id === 0 && scope.buildings[1].enabled === false) {
            scope.buildings[1].enabled = true;
            scope.buildings[6].enabled = true;
            scope.activateDungeon();
            scope.createMonster(1);
        }
        switch (building.id) {
            case 0: {
                if (scope.openHeroDialog) scope.openHeroDialog();
                scope.heroEnabled = false;
                if (building.count === 5) scope.activateBlueprint(3);
                if (scope.panelNumber === 3) scope.nextTutorial();
                break;
            }
            case 1: {
                scope.maxResources = building.cost + Math.floor(building.cost / 10);
                scope.maxGold = Math.floor(building.cost / 10);
                if (scope.buildings[2].count === 0) {
                    scope.buildings[2].enabled = true;
                    scope.prodEnabled = false;
                    scope.jobs[1].enabled = true;
                } else if (scope.buildings[4].count === 0) {
                    scope.activateBlueprint(2);
                }
                if (scope.panelNumber === 6) scope.nextTutorial();
                break;
            }
            case 2: {
                if (!scope.buildings[3].enabled) {
                    scope.blueprints[0].enabled = true;
                    scope.buildings[2].enabled = false;
                    if (scope.panelNumber === 13) scope.nextTutorial();
                }
                break;
            }
            case 3: {
                if (scope.buildings[3].count + 1 < scope.weapons.length) {
                    scope.weapons[scope.buildings[3].count].enabled = true;
                    if (scope.panelNumber === 15) scope.nextTutorial();
                } else {
                    scope.weapons[scope.buildings[3].count].enabled = true;
                    scope.buildings[3].enabled = false;
                }
                if (scope.buildings[3].count % 3 === 0) scope.jobs[2].limit++;
                scope.jobs[2].enabled = true;
                break;
            }
            case 4: {
                scope.buildings[4].enabled = false;
                scope.upgEnabled = false;
                scope.buildings[9].enabled = true;
                if (scope.panelNumber === 19) scope.nextTutorial();
                break;
            }
            case 5: {
                if (scope.buildings[5].count + 1 < scope.potions.length) {
                    scope.potions[scope.buildings[5].count - 1].enabled = true;
                } else {
                    scope.potions[scope.buildings[5].count].enabled = true;
                    scope.buildings[5].enabled = false;
                }
                if (scope.buildings[5].count % 3 === 0) scope.jobs[1].limit++;
                break;
            }
            case 6: {
                if (scope.dungeons.length < 14) {
                    scope.activateDungeon();
                    if (scope.panelNumber === 11) scope.nextTutorial();
                } else {
                    scope.activateDungeon();
                    scope.activateBlueprint(4);
                    scope.buildings[6].enabled = false;
                }
                break;
            }
            case 7:
                scope.buildings[7].enabled = false;
            case 9: {
                if (scope.openWorkerDialog) scope.openWorkerDialog();
                break;
            }
        }
    }

    function incrBlueprint(scope, blueprint) {
        if (!EconomyService.decGold(blueprint.cost)) {
            scope.showError("You do not have enough Gold");
            return;
        }
        blueprint.enabled = false;
        if (blueprint.buildingID > 0) {
            scope.buildings[blueprint.buildingID].enabled = true;
            blueprint.cost = 0;
            if (scope.panelNumber === 14) scope.nextTutorial();
        } else {
            switch (blueprint.buildingID) {
                case -1:
                    break;
                case -2:
                    scope.bestiary = true;
                    scope.beastEnabled = false;
                    break;
            }
        }
    }

    return {
        incrBuilding,
        incrBlueprint
    };
}

export default BuildingServiceFactory;
