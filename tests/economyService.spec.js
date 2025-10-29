import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import createEconomyService from '../src/services/economy.service.js';
import { bootstrapAngular, createInjector } from './utils/angular.js';

describe('EconomyService', () => {
    describe('factory logic', () => {
        it('manages resource and gold totals against their limits', () => {
            const economy = createEconomyService();
            const state = {
                resources: 10,
                maxResources: 25,
                gold: 5,
                maxGold: 20,
                goldMulti: 2
            };

            economy.bindState(state);

            assert.strictEqual(economy.incResources(5), 15);
            assert.strictEqual(state.resources, 15);

            economy.incResources(20);
            assert.strictEqual(state.resources, 25);

            assert.strictEqual(economy.decResources(5), true);
            assert.strictEqual(state.resources, 20);
            assert.strictEqual(economy.decResources(30), false);
            assert.strictEqual(state.resources, 20);

            assert.strictEqual(economy.incGold(2), 9);
            economy.incGold(20);
            assert.strictEqual(state.gold, 20);

            assert.strictEqual(economy.decGold(4), true);
            assert.strictEqual(state.gold, 16);
            assert.strictEqual(economy.decGold(50), false);
            assert.strictEqual(state.gold, 16);
        });
    });

    describe('Angular integration', () => {
        let EconomyService;

        before(async () => {
            await bootstrapAngular({ modules: ['src/controllers/economy.service.js'] });
            const injector = createInjector();
            EconomyService = injector.get('EconomyService');
        });

        it('exposes the same API when resolved through the Angular injector', () => {
            const state = {
                resources: 0,
                maxResources: 10,
                gold: 0,
                maxGold: 10,
                goldMulti: 1
            };

            EconomyService.bindState(state);
            EconomyService.incResources(12);
            assert.strictEqual(state.resources, 10);

            EconomyService.incGold(5);
            assert.strictEqual(state.gold, 5);

            assert.strictEqual(EconomyService.decResources(5), true);
            assert.strictEqual(state.resources, 5);
        });
    });
});
