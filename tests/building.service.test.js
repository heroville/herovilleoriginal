'use strict';

const assert = require('assert');

/**
 * Unit tests for BuildingService with explicit state and actions (no scope).
 * Shows how to test by passing mock state and actions.
 */
(async function runBuildingServiceTests() {
    const { default: createBuildingService } = await import('../src/services/building.service.js');
    const mockGameState = { getState: () => null };
    const mockGameUi = {};
    const mockDungeon = {};
    const mockProduction = {};
    const BuildingService = createBuildingService(mockGameState, mockGameUi, mockDungeon, mockProduction);

    const calls = { showError: [], decResources: null, decGold: null };
    const state = {
        buildings: [
            { id: 0, count: 0, enabled: true, cost: 5, multiplier: 4 },
            { id: 1, count: 0, enabled: false, cost: 25, multiplier: 5 },
            { id: 2, count: 0, enabled: false },
            { id: 3, count: 0, enabled: false },
            { id: 4, count: 0, enabled: false },
            { id: 5, count: 0, enabled: false },
            { id: 6, count: 0, enabled: false },
            { id: 7, count: 0, enabled: false },
            { id: 9, count: 0, enabled: false }
        ],
        jobs: [{ id: 0 }, { id: 1, enabled: false, limit: 1 }, { id: 2, enabled: false, limit: 1 }],
        upgrades: [],
        blueprints: [],
        weapons: [{ id: 0 }],
        potions: [],
        dungeons: [],
        panelNumber: 0,
        heroEnabled: true,
        prodEnabled: true,
        upgEnabled: true,
        maxResources: 25,
        maxGold: 0,
        bestiary: false,
        beastEnabled: true
    };
    const actions = {
        decResources: (v) => (calls.decResources = v, true),
        decGold: (v) => (calls.decGold = v, true),
        showError: (m) => calls.showError.push(m),
        nextTutorial: () => {},
        activateDungeon: () => {},
        createMonster: () => {},
        activateBlueprint: () => {},
        openHeroDialog: () => {},
        openWorkerDialog: () => {}
    };

    const building = state.buildings[0];
    BuildingService.incrBuilding(state, actions, building);

    assert.strictEqual(building.count, 1, 'building count should increment');
    assert.strictEqual(calls.decResources, 5, 'decResources should be called with building cost');
    assert.strictEqual(state.buildings[1].enabled, true, 'Stockpile should be enabled after first Tent');
    assert.strictEqual(state.buildings[6].enabled, true, 'Dungeons should be enabled');
    assert.strictEqual(state.heroEnabled, false, 'hero tab should be disabled until hero added');

    calls.showError = [];
    actions.decResources = () => false;
    const building1 = { id: 1, count: 0, cost: 25, multiplier: 5 };
    BuildingService.incrBuilding(state, actions, building1);
    assert.strictEqual(calls.showError.length, 1, 'showError should be called when resources insufficient');
    assert.ok(calls.showError[0].toLowerCase().includes('resource'), 'error message should mention resources');

    const blueprint = { buildingID: 2, cost: 5, enabled: true };
    state.buildings[2] = { enabled: false };
    actions.decGold = (v) => (v === 5 && true);
    BuildingService.incrBlueprint(state, actions, blueprint);
    assert.strictEqual(blueprint.enabled, false, 'blueprint should be disabled after purchase');
    assert.strictEqual(state.buildings[2].enabled, true, 'building should be enabled by blueprint');

    console.log('BuildingService tests passed');
}()).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
