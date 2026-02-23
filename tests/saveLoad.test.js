'use strict';

const assert = require('assert');

(async function runSaveLoadTests() {
    const { default: GameConfig } = await import('../src/constants/gameConfig.data.js');
    const { default: SaveLoadServiceFactory } = await import('../src/services/saveLoad.service.js');

    const SaveLoadService = SaveLoadServiceFactory(GameConfig);

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function createScope() {
        const heroClasses = clone(GameConfig.heroClasses);
        return {
            version: '1.3',
            resources: 0,
            maxResources: 25,
            gold: 0,
            maxGold: 0,
            incr: 1,
            restAmount: 2,
            buildings: clone(GameConfig.buildings),
            blueprints: clone(GameConfig.blueprints),
            weapons: clone(GameConfig.weapons),
            potions: clone(GameConfig.potions),
            heroClass: heroClasses,
            heroList: [],
            upgrades: [
                { id: 0, name: 'Upgrade 1', price: 10, enabled: false },
                { id: 1, name: 'Upgrade 2', price: 20, enabled: false }
            ],
            journeys: [],
            bossBattle: [],
            battles: [],
            dungeons: [],
            jobs: [
                { id: 0, name: 'Gather', current: 0, limit: 100, enabled: true },
                { id: 1, name: 'Apothecary', current: 0, limit: 1, enabled: false },
                { id: 2, name: 'Smith', current: 0, limit: 1, enabled: false }
            ],
            potion: {
                id: -1,
                name: 'Healing Herbs',
                healing: 20,
                count: 0,
                maxCount: 5,
                cost: 10,
                prodTime: 5,
                sellPrice: 1,
                working: 0
            },
            monsters: [],
            bosses: [],
            bestiary: false,
            successCount: { amount: 3 },
            lossCount: { amount: 1 },
            party: [],
            gameStats: {
                battles: 0,
                wins: 0,
                losses: 0,
                weaponsAuto: 0,
                weaponsManual: [],
                buffs: 0,
                clicks: 0
            },
            panelNumber: 0,
            showTutorial: true,
            panel: [],
            showError: function () {},
            skipTut: function () {},
            nextTutorial: function () {}
        };
    }

    (function executeTests() {
        const scope = createScope();
        scope.resources = 100;
        scope.maxResources = 100;
        scope.gold = 50;
        scope.maxGold = 150;
        scope.incr = 10;
        scope.restAmount = 5;
        scope.upgrades = [
            { id: 0, name: 'Upgrade 1', price: 10, enabled: true },
            { id: 1, name: 'Upgrade 2', price: 20, enabled: false }
        ];
        scope.dungeons = [
            { id: 0, name: 'Dungeon 1', level: 1, steps: 10, encounterRate: 50 },
            { id: 1, name: 'Dungeon 2', level: 2, steps: 20, encounterRate: 30 }
        ];
        scope.monsters = [
            { id: 0, name: 'Slime', value: 10, minDamage: 1, maxDamage: 3, health: 20 },
            { id: 1, name: 'Goblin', value: 20, minDamage: 2, maxDamage: 5, health: 30 }
        ];
        scope.bosses = [
            { id: 0, name: 'Dragon', minDamage: 10, maxDamage: 20, health: 100 },
            { id: 1, name: 'Lich', minDamage: 15, maxDamage: 25, health: 120 }
        ];

        const saveState = SaveLoadService.buildSavePayload(scope);
        const loadedScope = createScope();
        SaveLoadService.loadData(loadedScope, saveState);

        assert.strictEqual(loadedScope.resources, scope.resources, 'Resources should match after load');
        assert.strictEqual(loadedScope.maxResources, scope.maxResources, 'Max resources should match after load');
        assert.strictEqual(loadedScope.gold, scope.gold, 'Gold should match after load');
        assert.strictEqual(loadedScope.maxGold, scope.maxGold, 'Max gold should match after load');
        assert.strictEqual(loadedScope.incr, scope.incr, 'Increment should match after load');
        assert.strictEqual(loadedScope.restAmount, scope.restAmount, 'Rest amount should match after load');
        assert.deepStrictEqual(loadedScope.upgrades, scope.upgrades, 'Upgrades should match after load');
        assert.deepStrictEqual(loadedScope.dungeons, scope.dungeons, 'Dungeons should match after load');
        assert.deepStrictEqual(loadedScope.monsters, scope.monsters, 'Monsters should match after load');
        assert.deepStrictEqual(loadedScope.bosses, scope.bosses, 'Bosses should match after load');
        assert.deepStrictEqual(loadedScope.successCount, scope.successCount, 'Success count should match after load');
        assert.deepStrictEqual(loadedScope.lossCount, scope.lossCount, 'Loss count should match after load');
        assert.strictEqual(loadedScope.panelNumber, scope.panelNumber - 1, 'Panel number after load is panelNumber-1');
        assert.strictEqual(loadedScope.showTutorial, scope.showTutorial, 'Show tutorial flag should match after load');
        assert.deepStrictEqual(loadedScope.jobs, scope.jobs, 'Jobs should match after load');
        assert.deepStrictEqual(loadedScope.potion, scope.potion, 'Potion should match after load');
        assert.deepStrictEqual(loadedScope.gameStats, scope.gameStats, 'Game stats should match after load');

        console.log('Save/Load tests passed');
    }());
}()).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
