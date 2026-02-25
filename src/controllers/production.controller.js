/**
 * Production tab: potions, weapons, blueprints.
 * Inherits state and DOM callbacks (createPotion, buyWeapon, etc.) from MainController; uses GameUiService for toasts/tutorial.
 */
import app from '../app.js';

app.controller('ProductionController', function ($scope, BuildingService, EconomyService, ProductionService, GameUiService) {
    $scope.create = function (itemID) {
        const { createState, createActions } = buildProductionStateAndActions($scope);
        ProductionService.create(createState, createActions, itemID);
    };

    $scope.purchaseWeapon = function (weapon) {
        const { purchaseWeaponState, purchaseWeaponActions } = buildProductionStateAndActions($scope);
        ProductionService.purchaseWeapon(purchaseWeaponState, purchaseWeaponActions, weapon);
    };

    $scope.incrBlueprint = function (blueprint) {
        const { state, actions } = BuildingService.buildStateAndActions({
            decResources: (v) => EconomyService.decResources(v),
            decGold: (v) => EconomyService.decGold(v)
        });
        BuildingService.incrBlueprint(state, actions, blueprint);
    };

    function buildProductionStateAndActions(scope) {
        const s = scope.state;
        const createState = {
            potion: s.potion,
            potions: s.potions,
            get resources() { return s.resources; },
            get panelNumber() { return s.panelNumber; }
        };
        const createActions = {
            decResources: (v) => EconomyService.decResources(v),
            showError: (m) => GameUiService.showError(m),
            nextTutorial: () => GameUiService.nextTutorial(),
            disablePotionButton: (id) => scope.disablePotionButton(id),
            startCreatePotion: () => scope.createPotion(true, 0),
            startCreatePotions: (id) => scope.createPotions(id, true, 0)
        };
        const purchaseWeaponState = {
            weapons: s.weapons,
            get resources() { return s.resources; },
            buildings: s.buildings,
            upgrades: s.upgrades,
            gameStats: s.gameStats,
            get panelNumber() { return s.panelNumber; }
        };
        const purchaseWeaponActions = {
            decResources: (v) => EconomyService.decResources(v),
            showError: (m) => GameUiService.showError(m),
            nextTutorial: () => GameUiService.nextTutorial(),
            disableWeaponButton: (id) => scope.disableWeaponButton(id),
            startBuyWeapon: (id) => scope.buyWeapon(id, true, 0)
        };
        return { createState, createActions, purchaseWeaponState, purchaseWeaponActions };
    }
});
