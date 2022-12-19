import app from "../../app";

app.service("buildingsService", function BuildingsService(buildings,resourcesService,resources,dungeonService,monstersService, messageService,heroesService) {
    this.incrBuilding = function (building) {
        if (resourcesService.decResources(building.cost, true)) {
          building.count++;
          building.cost = Math.ceil(
            building.baseCost + Math.pow(building.multiplier,(building.count)) 
          );
          if (building.id == 0 && buildings[1].enabled == false) {
            buildings[1].enabled = true;
            buildings[6].enabled = true;
            dungeonService.activateDungeon();
            monstersService.createMonster(1);
          }
          switch (building.id) {
            //Building Tent
            case 0: {
              heroesService.createHero();
              if (building.count == 5) {
                $scope.activateBlueprint(3);
              }
              break;
            }
            // Building Stockpile
            case 1: {
              resources.maxResources =
                building.cost + Math.floor(building.cost / 10);
              $scope.maxGold = Math.floor(building.cost / 10);
              if (buildings[2].count == 0) {
                buildings[2].enabled = true;
                $scope.prodEnabled = false;
                $scope.jobs[1].enabled = true;
              } else if ($scope.buildings[4].count == 0) {
                $scope.activateBlueprint(2);
              }
              break;
            }
            //Building Market
            case 2: {
              if (!buildings[3].enabled) {
                $scope.blueprints[0].enabled = true;
                $scope.buildings[2].enabled = false;
              }
              break;
            }
            //Building Blacksmith
            case 3: {
              if (buildings[3].count + 1 < $scope.weapons.length) {
                $scope.weapons[$scope.buildings[3].count].enabled = true;
              } else {
                $scope.weapons[$scope.buildings[3].count].enabled = true;
    
                buildings[3].enabled = false;
              }
              if (buildings[3].count % 3 == 0) {
                $scope.jobs[2].limit++;
              }
              $scope.jobs[2].enabled = true;
              break;
            }
            //Build Tavern
            case 4: {
              buildings[4].enabled = false;
              $scope.upgEnabled = false;
              $scope.buildings[9].enabled = true;
              break;
            }
            //Build Alchemist
            case 5: {
              if (buildings[5].count + 1 < $scope.potions.length) {
                $scope.potions[$scope.buildings[5].count - 1].enabled = true;
              } else {
                $scope.potions[$scope.buildings[5].count].enabled = true;
                buildings[5].enabled = false;
              }
              if (buildings[5].count % 3 == 0) {
                $scope.jobs[1].limit++;
              }
    
              break;
            }
            //Build Dungeon
            case 6: {
              if ($scope.dungeons.length < 14) {
                $scope.activateDungeon();
              } else {
                $scope.activateDungeon();
                $scope.activateBlueprint(4);
                buildings[6].enabled = false;
              }
              break;
            }
            //Build Bestiary
            case 7: {
              buildings[7].enabled = false;
            }
            case 9: {
              $("#dialog2").dialog("open");
            }
          }
        } else {
          messageService.showMessage("You do not have enough Resources");
        }
      };
});