import app from "../../app";

app.service("buildingsService", function BuildingsService(buildings, resourcesService, resources, gold, dungeonService, monstersService, messageService, heroesService, dungeons) {
    this.incrBuilding = function (building) {
        if (resourcesService.decResources(building.cost, true)) {
            building.count++;
            building.cost = Math.ceil(
                building.baseCost + Math.pow(building.multiplier, (building.count))
            );
            if (building.id == 'tent' && buildings.find(b => b.id === 'stockpile').enabled == false) {
                buildings.find(b => b.id === 'stockpile').enabled = true;
                buildings.find(b => b.id === 'dungeons').enabled = true;
                dungeonService.activateDungeon();
            }
            switch (building.id) {
                //Building Tent
                case 'tent': {
                    heroesService.createHero();
                    if (building.count == 5) {
                        // TODO: Remove $scope
                        $scope.activateBlueprint('market');
                    }
                    break;
                }
                // Building Stockpile
                case 'stockpile': {
                    resources.max =
                        building.cost + Math.floor(building.cost / 10);
                    gold.max = Math.floor(building.cost / 10);
                    if (buildings.find(b => b.id === 'market').count == 0) {
                        buildings.find(b => b.id === 'market').enabled = true;
                    } else if (buildings.find(b => b.id === 'tavern').count == 0) {
                        // TODO: Remove $scope
                        $scope.activateBlueprint('stockpile');
                    }
                    break;
                }
                //Building Market
                case 'market': {
                    if (!buildings.find(b => b.id === 'blacksmith').enabled) {
                        // TODO: Remove $scope
                        $scope.blueprints[0].enabled = true;
                        // TODO: Remove $scope
                        $scope.buildings.find(b => b.id === 'stockpile').enabled = false;
                    }
                    break;
                }
                //Building Blacksmith
                case 'blacksmith': {
                    if (buildings.find(b => b.id === 'blacksmith').count + 1 < $scope.weapons.length) {
                        // TODO: Remove $scope
                        $scope.weapons[$scope.buildings.find(b => b.id === 'blacksmith').count].enabled = true;
                    } else {
                        // TODO: Remove $scope
                        $scope.weapons[$scope.buildings.find(b => b.id === 'blacksmith').count].enabled = true;

                        buildings.find(b => b.id === 'blacksmith').enabled = false;
                    }
                    if (buildings.find(b => b.id === 'blacksmith').count % 3 == 0) {
                        // TODO: Remove $scope
                        $scope.jobs[2].limit++;
                    }
                    // TODO: Remove $scope
                    $scope.jobs[2].enabled = true;
                    break;
                }
                //Build Tavern
                case 'tavern': {
                    buildings.find(b => b.id === 'tavern').enabled = false;
                    // TODO: Remove $scope
                    $scope.upgEnabled = false;
                    // TODO: Remove $scope
                    $scope.buildings.find(b => b.id === 'workHut').enabled = true;
                    break;
                }
                //Build Alchemist
                case 'alchemist': {
                    if (buildings.find(b => b.id === 'alchemist').count + 1 < $scope.potions.length) {
                        // TODO: Remove $scope
                        $scope.potions[$scope.buildings.find(b => b.id === 'alchemist').count - 1].enabled = true;
                    } else {
                        // TODO: Remove $scope
                        $scope.potions[$scope.buildings.find(b => b.id === 'alchemist').count].enabled = true;
                        buildings.find(b => b.id === 'alchemist').enabled = false;
                    }
                    if (buildings.find(b => b.id === 'alchemist').count % 3 == 0) {
                        // TODO: Remove $scope
                        $scope.jobs[1].limit++;
                    }

                    break;
                }
                //Build Dungeon
                case 'dungeons': {
                    if (dungeons.length < 14) {
                        dungeonService.activateDungeon();
                    } else {
                        dungeonService.activateDungeon();
                        // TODO: Remove $scope
                        $scope.activateBlueprint('eliteDungeons');
                        buildings.find(b => b.id === 'dungeons').enabled = false;
                    }
                    break;
                }
                //Build Bestiary
                case 'bestiary': {
                    buildings.find(b => b.id === 'bestiary').enabled = false;
                }
                case 'workHut': {
                    $("#dialog2").dialog("open");
                }
            }
        } else {
            messageService.showMessage("You do not have enough Resources");
        }
    };

    this.findBuilding = function (id) {
        return buildings.find((b) => b.id === id);
    };
});