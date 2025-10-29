import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import GameConfig from '../src/constants/gameConfig.data.js';

describe('save/load routines', () => {
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
            upgrades: [],
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
            showTutorial: true
        };
    }

    function save(scope) {
        return JSON.parse(JSON.stringify({
            resources: scope.resources,
            maxResources: scope.maxResources,
            gold: scope.gold,
            maxGold: scope.maxGold,
            incr: scope.incr,
            restAmount: scope.restAmount,
            buildings: scope.buildings,
            blueprints: scope.blueprints,
            heroList: scope.heroList,
            weapons: scope.weapons,
            potions: scope.potions,
            upgrades: scope.upgrades,
            dungeons: scope.dungeons,
            monsters: scope.monsters,
            bosses: scope.bosses,
            successCount: scope.successCount,
            lossCount: scope.lossCount,
            panelNumber: scope.panelNumber,
            showTutorial: scope.showTutorial,
            jobs: scope.jobs,
            potion: scope.potion,
            gameStats: scope.gameStats
        }));
    }

    function load(scope, saveState) {
        scope.resources = saveState.resources;
        scope.maxResources = saveState.maxResources;
        scope.gold = saveState.gold;
        scope.maxGold = saveState.maxGold;
        scope.incr = saveState.incr;
        scope.restAmount = saveState.restAmount;
        scope.buildings = saveState.buildings;
        scope.blueprints = saveState.blueprints;
        scope.heroList = saveState.heroList;
        scope.weapons = saveState.weapons;
        scope.potions = saveState.potions;
        scope.upgrades = saveState.upgrades;
        scope.dungeons = saveState.dungeons;
        scope.monsters = saveState.monsters;
        scope.bosses = saveState.bosses;
        scope.successCount = saveState.successCount;
        scope.lossCount = saveState.lossCount;
        scope.panelNumber = saveState.panelNumber;
        scope.showTutorial = saveState.showTutorial;
        scope.jobs = saveState.jobs;
        scope.potion = saveState.potion;
        scope.gameStats = saveState.gameStats;
        return scope;
    }

    it('restores a saved scope snapshot without mutating the source data', () => {
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

        const saveState = save(scope);
        const loadedScope = load(createScope(), saveState);

        assert.deepStrictEqual(loadedScope.resources, scope.resources, 'resources should match after load');
        assert.deepStrictEqual(loadedScope.maxResources, scope.maxResources, 'max resources should match after load');
        assert.deepStrictEqual(loadedScope.gold, scope.gold, 'gold should match after load');
        assert.deepStrictEqual(loadedScope.maxGold, scope.maxGold, 'max gold should match after load');
        assert.deepStrictEqual(loadedScope.incr, scope.incr, 'increment should match after load');
        assert.deepStrictEqual(loadedScope.restAmount, scope.restAmount, 'rest amount should match after load');
        assert.deepStrictEqual(loadedScope.upgrades, scope.upgrades, 'upgrades should match after load');
        assert.deepStrictEqual(loadedScope.dungeons, scope.dungeons, 'dungeons should match after load');
        assert.deepStrictEqual(loadedScope.monsters, scope.monsters, 'monsters should match after load');
        assert.deepStrictEqual(loadedScope.bosses, scope.bosses, 'bosses should match after load');
        assert.deepStrictEqual(loadedScope.successCount, scope.successCount, 'success count should match after load');
        assert.deepStrictEqual(loadedScope.lossCount, scope.lossCount, 'loss count should match after load');
        assert.deepStrictEqual(loadedScope.panelNumber, scope.panelNumber, 'panel number should match after load');
        assert.deepStrictEqual(loadedScope.showTutorial, scope.showTutorial, 'show tutorial flag should match after load');
        assert.deepStrictEqual(loadedScope.jobs, scope.jobs, 'jobs should match after load');
        assert.deepStrictEqual(loadedScope.potion, scope.potion, 'potion should match after load');
        assert.deepStrictEqual(loadedScope.gameStats, scope.gameStats, 'game stats should match after load');

        assert.notStrictEqual(saveState, scope, 'the saved snapshot should be a copy');
    });
});
