'use strict';

const assert = require('assert');
const createEconomyService = require('../Controllers/economy.service.js');

(function runEconomyServiceTests() {
    const economy = createEconomyService();
    const state = {
        resources: 10,
        maxResources: 25,
        gold: 5,
        maxGold: 20,
        goldMulti: 2
    };

    economy.bindState(state);

    assert.strictEqual(economy.incResources(5), 15, 'resources should increase by the requested amount');
    assert.strictEqual(state.resources, 15, 'state should be updated by the service');

    economy.incResources(20);
    assert.strictEqual(state.resources, 25, 'resource gain should clamp to the maximum capacity');

    assert.strictEqual(economy.decResources(5), true, 'spending resources within budget should succeed');
    assert.strictEqual(state.resources, 20, 'spending resources should reduce the stored amount');
    assert.strictEqual(economy.decResources(30), false, 'spending more resources than available should fail');
    assert.strictEqual(state.resources, 20, 'failed spending attempts should leave resources untouched');

    assert.strictEqual(economy.incGold(2), 9, 'gold gains should consider the active multiplier');
    economy.incGold(20);
    assert.strictEqual(state.gold, 20, 'gold gains should clamp to the maximum capacity');

    assert.strictEqual(economy.decGold(4), true, 'gold spending within the available amount should succeed');
    assert.strictEqual(state.gold, 16, 'successful gold spending should reduce stored gold');
    assert.strictEqual(economy.decGold(50), false, 'gold spending should fail when funds are insufficient');
    assert.strictEqual(state.gold, 16, 'failed gold spending attempts should not change stored gold');

    console.log('EconomyService tests passed');
}());
