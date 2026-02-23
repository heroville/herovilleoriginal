/**
 * Save/Load/Reset game state to localStorage.
 * Used by MainController; receives scope and mutates it (loadData) or uses it to build payload (save).
 */

function SaveLoadServiceFactory(GameConfig) {
    const HERO_CLASSES = GameConfig.heroClasses || [];

    function reset(scope) {
        const raw = localStorage.getItem('data');
        if (!raw) {
            scope.showError('No save data to reset.');
            return;
        }
        let data;
        try {
            data = JSON.parse(raw);
        } catch (error) {
            scope.showError('Failed to reset save data: ' + error.message);
            localStorage.removeItem('data');
            return;
        }
        data.saveVersion = 'Reset';
        localStorage.setItem('data', JSON.stringify(data));
        location.reload();
    }

    function buildSavePayload(scope, opts) {
        const heroTable = (opts && opts.heroTable !== undefined) ? opts.heroTable : scope.heroTable;
        return {
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
            heroTable: heroTable,
            success: scope.successCount.amount,
            losses: scope.lossCount.amount,
            party: scope.party,
            gameStats: scope.gameStats,
            panelNumber: scope.panelNumber,
            showTutorial: scope.showTutorial
        };
    }

    function save(scope, opts) {
        const data = buildSavePayload(scope, opts);
        localStorage.setItem('data', JSON.stringify(data));
        scope.showError('Game has saved');
    }

    /**
     * Apply saved data onto scope (same shape as controller's loadData).
     * If data is omitted, reads from localStorage and applies.
     * @param {object} scope - Game scope (must have skipTut, nextTutorial, showError)
     * @param {object} [data] - Parsed save object; if undefined, read from localStorage
     * @returns {boolean} - true if data was applied, false if no data or parse error
     */
    function loadData(scope, data) {
        if (data === undefined) {
            const raw = localStorage.getItem('data');
            if (!raw) return false;
            try {
                data = JSON.parse(raw);
            } catch (error) {
                scope.showError('Failed to load save data. Clearing corrupted save. Error: ' + error.message);
                localStorage.removeItem('data');
                return false;
            }
        }

        scope.resources = data.resources;
        scope.maxResources = data.maxResources;
        scope.gold = data.gold;
        scope.maxGold = data.maxGold;
        scope.incr = data.incr;
        scope.restAmount = data.restAmount;
        scope.dungeons = data.dungeons;
        scope.monsters = data.monsters;
        scope.bosses = data.bosses;

        if (data.buildings && scope.buildings) {
            for (let i = 0; i < data.buildings.length; i++) {
                scope.buildings[i].cost = data.buildings[i].cost;
                scope.buildings[i].count = data.buildings[i].count;
                scope.buildings[i].tier = data.buildings[i].tier;
                scope.buildings[i].enabled = data.buildings[i].enabled;
            }
        }
        if (data.blueprints && scope.blueprints) {
            for (let i = 0; i < data.blueprints.length; i++) {
                scope.blueprints[i].enabled = data.blueprints[i].enabled;
            }
        }
        if (data.upgrades && scope.upgrades) {
            for (let i = 0; i < data.upgrades.length; i++) {
                scope.upgrades[i].enabled = data.upgrades[i].enabled;
            }
        }
        if (data.jobs && scope.jobs) {
            for (let i = 0; i < data.jobs.length; i++) {
                scope.jobs[i].enabled = data.jobs[i].enabled;
            }
        }

        scope.heroList = data.heroList || [];
        const classIds = HERO_CLASSES.length ? [HERO_CLASSES[0].id, HERO_CLASSES[2] && HERO_CLASSES[2].id] : [];
        for (let i = 0; i < scope.heroList.length; i++) {
            const hero = scope.heroList[i];
            if (hero.academy && (hero.academy.id === classIds[0] || hero.academy.id === classIds[1])) {
                hero.location = 'Home';
                hero.progress = 'Idle';
            } else {
                hero.progress = 'Idle';
            }
            hero.autoAdventure = false;
            if (hero.job) hero.job.current++;
        }

        if (data.weapons && scope.weapons) {
            for (let i = 0; i < data.weapons.length; i++) {
                scope.weapons[i].minDamage = data.weapons[i].minDamage;
                scope.weapons[i].cost = data.weapons[i].cost;
                scope.weapons[i].durability = data.weapons[i].durability;
                scope.weapons[i].prodTime = data.weapons[i].prodTime;
                scope.weapons[i].count = data.weapons[i].count;
                scope.weapons[i].maxCount = data.weapons[i].maxCount;
                scope.weapons[i].enabled = data.weapons[i].enabled;
                scope.weapons[i].working = 0;
            }
        }
        if (data.potions && scope.potions) {
            for (let i = 0; i < data.potions.length; i++) {
                scope.potions[i].enabled = data.potions[i].enabled;
            }
        }

        scope.potion = data.potion || scope.potion;
        if (scope.potion) scope.potion.working = 0;
        scope.bestiary = data.bestiary;

        if (scope.buildings && scope.buildings[0]) {
            scope.heroEnabled = scope.buildings[0].count > 0 ? false : scope.heroEnabled;
        }
        if (scope.buildings && scope.buildings[1]) {
            scope.prodEnabled = scope.buildings[1].count > 0 ? false : scope.prodEnabled;
        }
        if (scope.buildings && scope.buildings[4]) {
            scope.upgEnabled = scope.buildings[4].count > 0 ? false : scope.upgEnabled;
        }
        if (data.bestiary) {
            scope.beastEnabled = false;
        }

        scope.heroTable = data.heroTable;
        scope.successCount.amount = data.success !== undefined ? data.success : scope.successCount.amount;
        scope.lossCount.amount = data.losses !== undefined ? data.losses : scope.lossCount.amount;
        scope.party = data.party || scope.party;
        scope.gameStats = data.gameStats || scope.gameStats;

        if (data.panelNumber === 22) {
            if (typeof scope.skipTut === 'function') scope.skipTut();
            scope.panel = ['Game successfully loaded'];
        } else {
            scope.panelNumber = (data.panelNumber - 1);
            scope.showTutorial = data.showTutorial;
            if (typeof scope.nextTutorial === 'function') scope.nextTutorial();
        }
        return true;
    }

    /**
     * Load from localStorage; check version; apply if match.
     * @param {object} scope - Must have version, forceReset, showError; skipTut/nextTutorial used by loadData
     * @returns {'loaded'|'version_mismatch'|'no_data'|'parse_error'}
     */
    function load(scope) {
        const raw = localStorage.getItem('data');
        if (!raw) return 'no_data';
        let test;
        try {
            test = JSON.parse(raw);
        } catch (error) {
            scope.showError('Failed to parse save data. Clearing corrupted save. Error: ' + error.message);
            localStorage.removeItem('data');
            return 'parse_error';
        }
        if (!test) return 'no_data';
        if (test.saveVersion === 'Reset') {
            localStorage.removeItem('data');
            return 'no_data';
        }
        if (test.saveVersion !== scope.version) {
            if (scope.forceReset) {
                // legacy: optional clear
            }
            return 'version_mismatch';
        }
        loadData(scope, test);
        return 'loaded';
    }

    return {
        reset,
        save,
        load,
        loadData,
        buildSavePayload
    };
}

export default SaveLoadServiceFactory;
