/**
 * Single source of truth for all mutable game state.
 * Controllers bind scope to getState(); services read/write the same object.
 */

const DEFAULT_JOBS = [
    { id: 0, name: "Gather", current: 0, limit: 100, enabled: true, description: "A Gathering hero will collect resources every second." },
    { id: 1, name: "Apothecary", current: 0, limit: 1, enabled: false, description: "An Apothecary will make potions." },
    { id: 2, name: "Smith", current: 0, limit: 1, enabled: false, description: "A Smith will produce weapons." }
];

const DEFAULT_UPGRADES = [
    { id: 0, name: 'Bonus Resources I', price: 1, enabled: true },
    { id: 1, name: 'Save Point', price: 3, enabled: false },
    { id: 2, name: 'Bonus Resources II', price: 5, enabled: false },
    { id: 3, name: 'Bonus Resources III', price: 20, enabled: false },
    { id: 4, name: 'Bonus Resources IV', price: 80, enabled: false },
    { id: 5, name: 'Bonus Resources V', price: 350, enabled: false },
    { id: 6, name: 'Bonus Resources VI', price: 1000, enabled: false },
    { id: 7, name: 'Bonus Resources VII', price: 4000, enabled: false },
    { id: 8, name: 'Bonus Resources VIII', price: 15000, enabled: false },
    { id: 9, name: 'Bonus Resources IX', price: 45000, enabled: false },
    { id: 10, name: 'Bonus Resources X', price: 100000, enabled: false },
    { id: 11, name: 'Potion Capacity', price: 100, enabled: false },
    { id: 12, name: 'Potion Capacity II', price: 500, enabled: false },
    { id: 13, name: 'Potion Capacity III', price: 2000, enabled: false }
];

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function GameStateServiceFactory(GameConfig) {
    const buildings = deepCopy(GameConfig.buildings || []);
    const blueprints = deepCopy(GameConfig.blueprints || []);
    const jobs = deepCopy(DEFAULT_JOBS);
    const upgrades = deepCopy(DEFAULT_UPGRADES);
    const weapons = deepCopy(GameConfig.weapons || []);
    const potions = deepCopy(GameConfig.potions || []);
    const events = deepCopy(GameConfig.events || []);
    const heroClasses = deepCopy(GameConfig.heroClasses || []);

    const state = {
        panel: ["Welcome to Heroville, I will be your guide while you play. (Skip in Options/Help)"],
        panelNumber: 0,
        showTutorial: true,
        panelInfo: false,
        resources: 0,
        maxResources: 25,
        gold: 0,
        maxGold: 0,
        incr: 1,
        restAmount: 2,
        tempClass: null,
        tempHero: null,
        successCount: { amount: 3 },
        lossCount: { amount: 1 },
        randomEventTimer: 600000 + Math.floor(Math.random() * 600000),
        randomE: undefined,
        gameLoop: 1000,
        damageMulti: 1,
        goldMulti: 1,
        version: '1.3',
        optionsSuccess: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        optionsLoss: [1, 2, 3, 4],
        sorting: {
            heroTable: 'name',
            monList: 'value',
            bossList: 'value',
            heroWork: 'job.id',
            strict: true
        },
        predicate: 'name',
        bestiary: false,
        heroTable: false,
        showHeroTable: {},
        selectedDungeon: 0,
        heroEnabled: true,
        prodEnabled: true,
        upgEnabled: true,
        beastEnabled: true,
        hFilterString: {},
        heroCollapse: true,
        heroList: [],
        dungeons: [],
        monsters: [],
        bosses: [],
        party: [],
        battles: [],
        journeys: [],
        bossBattle: [],
        heroName: null,
        monsterList: null,
        dungeonNames: null,
        gameStats: {
            battles: 0,
            wins: 0,
            losses: 0,
            weaponsAuto: 0,
            weaponsManual: [],
            buffs: 0,
            clicks: 0
        },
        buildings,
        jobs,
        upgrades,
        blueprints,
        weapons,
        potion: {
            id: -1,
            name: "Healing Herbs",
            image: "P_Red04.png",
            healing: 20,
            description: "Restores 20% Health consumed on purchase.",
            count: 0,
            maxCount: 5,
            cost: 10,
            prodTime: 5,
            progress: "Create Potion",
            sellPrice: 1,
            working: 0
        },
        potions,
        events,
        heroClass: heroClasses
    };

    function getState() {
        return state;
    }

    return {
        getState
    };
}

export default GameStateServiceFactory;
