'use strict';

const assert = require('assert');
const GameConfig = require('../Controllers/gameConfig.constant.js');

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
        journeys: scope.journeys,
        bossBattle: scope.bossBattle,
        battles: scope.battles,
        dungeons: scope.dungeons,
        jobs: scope.jobs,
        potion: scope.potion,
        saveVersion: scope.version,
        monsters: scope.monsters,
        bosses: scope.bosses,
        bestiary: scope.bestiary,
        heroTable: false,
        success: scope.successCount.amount,
        losses: scope.lossCount.amount,
        party: scope.party,
        gameStats: scope.gameStats,
        panelNumber: scope.panelNumber,
        showTutorial: scope.showTutorial
    }));
}

function loadData(scope, data) {
    scope.resources = data.resources;
    scope.maxResources = data.maxResources;
    scope.gold = data.gold;
    scope.maxGold = data.maxGold;
    scope.incr = data.incr;
    scope.restAmount = data.restAmount;
    scope.dungeons = data.dungeons;
    scope.monsters = data.monsters;
    scope.bosses = data.bosses;

    data.buildings.forEach((savedBuilding, index) => {
        Object.assign(scope.buildings[index], {
            cost: savedBuilding.cost,
            count: savedBuilding.count,
            tier: savedBuilding.tier,
            enabled: savedBuilding.enabled
        });
    });

    data.blueprints.forEach((savedBlueprint, index) => {
        scope.blueprints[index].enabled = savedBlueprint.enabled;
    });

    data.weapons.forEach((savedWeapon, index) => {
        Object.assign(scope.weapons[index], {
            minDamage: savedWeapon.minDamage,
            cost: savedWeapon.cost,
            durability: savedWeapon.durability,
            prodTime: savedWeapon.prodTime,
            count: savedWeapon.count,
            maxCount: savedWeapon.maxCount,
            enabled: savedWeapon.enabled
        });
        scope.weapons[index].working = 0;
    });

    data.potions.forEach((savedPotion, index) => {
        scope.potions[index].enabled = savedPotion.enabled;
    });

    scope.heroList = data.heroList;
    scope.heroList.forEach((hero) => {
        if (hero.academy.id === GameConfig.heroClasses[0].id || hero.academy.id === GameConfig.heroClasses[2].id) {
            hero.location = 'Home';
            hero.progress = 'Idle';
        }
        else {
            hero.progress = 'Idle';
        }
        hero.autoAdventure = false;
        if (hero.job && typeof hero.job.current === 'number') {
            hero.job.current += 1;
        }
    });

    scope.potion = data.potion;
    scope.potion.working = 0;
    scope.bestiary = data.bestiary;
    scope.successCount.amount = data.success;
    scope.lossCount.amount = data.losses;
    scope.party = data.party;
    scope.gameStats = data.gameStats;
    scope.panelNumber = data.panelNumber;
    scope.showTutorial = data.showTutorial;
}

(function runTest() {
    const session = createScope();
    session.buildings[0].count = 3;
    session.buildings[0].cost = 55;
    session.buildings[0].enabled = false;
    session.blueprints[0].enabled = true;
    session.weapons[1].count = 2;
    session.weapons[1].enabled = true;
    session.potions[0].enabled = true;

    session.heroList.push({
        id: 0,
        name: 'Test Hero',
        academy: session.heroClass[2],
        job: session.jobs[0],
        location: 'Dungeon',
        progress: 'Exploring',
        autoAdventure: true
    });

    const saved = save(session);
    const restored = createScope();
    loadData(restored, saved);

    assert.strictEqual(restored.buildings[0].count, 3, 'building count should persist after load');
    assert.strictEqual(restored.buildings[0].enabled, false, 'building enabled flag should persist after load');
    assert.strictEqual(restored.blueprints[0].enabled, true, 'blueprint unlock should persist after load');
    assert.strictEqual(restored.weapons[1].enabled, true, 'weapon availability should persist after load');
    assert.strictEqual(restored.potions[0].enabled, true, 'potion availability should persist after load');
    assert.strictEqual(restored.heroList[0].location, 'Home', 'adventurers should return home on load');
    assert.strictEqual(restored.heroList[0].progress, 'Idle', 'hero progress should reset on load');
    assert.strictEqual(restored.heroList[0].autoAdventure, false, 'hero auto adventure should reset on load');
    assert.strictEqual(restored.heroList[0].job.current, 1, 'job counter should increment during load');
    assert.strictEqual(restored.potion.working, 0, 'active potion crafting should reset on load');
    assert.strictEqual(GameConfig.buildings[0].count, 0, 'GameConfig should remain immutable');

    console.log('save/load regression test passed');
}());
