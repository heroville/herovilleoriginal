/**
 * Town tab: buildings list, improve building, dungeons list.
 * Uses BuildingService; inherits shared state (buildings, dungeons, etc.) from parent MainController.
 */
import app from '../app.js';

app.controller('BuildingController', function ($scope, BuildingService, EconomyService) {
    $scope.incrBuilding = function (building) {
        const { state, actions } = BuildingService.buildStateAndActions({
            decResources: (v) => EconomyService.decResources(v),
            decGold: (v) => EconomyService.decGold(v)
        });
        BuildingService.incrBuilding(state, actions, building);
    };
});
