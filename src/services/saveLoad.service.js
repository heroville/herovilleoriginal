/**
 * Save/Load/Reset game state to localStorage.
 * Used by MainController; receives scope and mutates it (loadData) or uses it to build payload (save).
 */

function SaveLoadServiceFactory(GameConfig, GameUiService) {
    const HERO_CLASSES = GameConfig.heroClasses || [];

    function reset(scope) {
        const raw = localStorage.getItem('data');
        if (!raw) {
            GameUiService.showError('No save data to reset.');
            return;
        }
        let data;
        try {
            data = JSON.parse(raw);
        } catch (error) {
            GameUiService.showError('Failed to reset save data: ' + error.message);
            localStorage.removeItem('data');
            return;
        }
        data.saveVersion = 'Reset';
        localStorage.setItem('data', JSON.stringify(data));
        location.reload();
    }

    function buildSavePayload(scope, opts) {
        const s = scope.state;
        const heroTable = (opts && opts.heroTable !== undefined) ? opts.heroTable : s.heroTable;
        return {
            resources: s.resources,
            maxResources: s.maxResources,
            gold: s.gold,
            maxGold: s.maxGold,
            incr: s.incr,
            restAmount: s.restAmount,
            buildings: s.buildings,
            blueprints: s.blueprints,
            heroList: s.heroList,
            weapons: s.weapons,
            potions: s.potions,
            upgrades: s.upgrades,
            journeys: s.journeys,
            bossBattle: s.bossBattle,
            battles: s.battles,
            dungeons: s.dungeons,
            jobs: s.jobs,
            potion: s.potion,
            saveVersion: s.version,
            monsters: s.monsters,
            bosses: s.bosses,
            bestiary: s.bestiary,
            heroTable,
            success: s.successCount.amount,
            losses: s.lossCount.amount,
            party: s.party,
            gameStats: s.gameStats,
            panelNumber: s.panelNumber,
            showTutorial: s.showTutorial
        };
    }

    function save(scope, opts) {
        const data = buildSavePayload(scope, opts);
        localStorage.setItem('data', JSON.stringify(data));
        GameUiService.showError('Game has saved');
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
                GameUiService.showError('Failed to load save data. Clearing corrupted save. Error: ' + error.message);
                localStorage.removeItem('data');
                return false;
            }
        }

        const s = scope.state;
        s.resources = data.resources;
        s.maxResources = data.maxResources;
        s.gold = data.gold;
        s.maxGold = data.maxGold;
        s.incr = data.incr;
        s.restAmount = data.restAmount;
        s.dungeons = data.dungeons;
        s.monsters = data.monsters;
        s.bosses = data.bosses;

        if (data.buildings && s.buildings) {
            for (let i = 0; i < data.buildings.length; i++) {
                s.buildings[i].cost = data.buildings[i].cost;
                s.buildings[i].count = data.buildings[i].count;
                s.buildings[i].tier = data.buildings[i].tier;
                s.buildings[i].enabled = data.buildings[i].enabled;
            }
        }
        if (data.blueprints && s.blueprints) {
            for (let i = 0; i < data.blueprints.length; i++) {
                s.blueprints[i].enabled = data.blueprints[i].enabled;
            }
        }
        if (data.upgrades && s.upgrades) {
            for (let i = 0; i < data.upgrades.length; i++) {
                s.upgrades[i].enabled = data.upgrades[i].enabled;
            }
        }
        if (data.jobs && s.jobs) {
            for (let i = 0; i < data.jobs.length; i++) {
                s.jobs[i].enabled = data.jobs[i].enabled;
            }
        }

        s.heroList = data.heroList || [];
        const classIds = HERO_CLASSES.length ? [HERO_CLASSES[0].id, HERO_CLASSES[2] && HERO_CLASSES[2].id] : [];
        for (let i = 0; i < s.heroList.length; i++) {
            const hero = s.heroList[i];
            if (hero.academy && (hero.academy.id === classIds[0] || hero.academy.id === classIds[1])) {
                hero.location = 'Home';
                hero.progress = 'Idle';
            } else {
                hero.progress = 'Idle';
            }
            hero.autoAdventure = false;
            if (hero.job) hero.job.current++;
        }

        if (data.weapons && s.weapons) {
            for (let i = 0; i < data.weapons.length; i++) {
                s.weapons[i].minDamage = data.weapons[i].minDamage;
                s.weapons[i].cost = data.weapons[i].cost;
                s.weapons[i].durability = data.weapons[i].durability;
                s.weapons[i].prodTime = data.weapons[i].prodTime;
                s.weapons[i].count = data.weapons[i].count;
                s.weapons[i].maxCount = data.weapons[i].maxCount;
                s.weapons[i].enabled = data.weapons[i].enabled;
                s.weapons[i].working = 0;
            }
        }
        if (data.potions && s.potions) {
            for (let i = 0; i < data.potions.length; i++) {
                s.potions[i].enabled = data.potions[i].enabled;
            }
        }

        s.potion = data.potion || s.potion;
        if (s.potion) s.potion.working = 0;
        s.bestiary = data.bestiary;

        if (s.buildings && s.buildings[0]) {
            s.heroEnabled = s.buildings[0].count > 0 ? false : s.heroEnabled;
        }
        if (s.buildings && s.buildings[1]) {
            s.prodEnabled = s.buildings[1].count > 0 ? false : s.prodEnabled;
        }
        if (s.buildings && s.buildings[4]) {
            s.upgEnabled = s.buildings[4].count > 0 ? false : s.upgEnabled;
        }
        if (data.bestiary) {
            s.beastEnabled = false;
        }

        s.heroTable = data.heroTable;
        s.successCount.amount = data.success !== undefined ? data.success : s.successCount.amount;
        s.lossCount.amount = data.losses !== undefined ? data.losses : s.lossCount.amount;
        s.party = data.party || s.party;
        s.gameStats = data.gameStats || s.gameStats;

        if (data.panelNumber === 22) {
            if (typeof scope.skipTut === 'function') scope.skipTut();
            s.panel = ['Game successfully loaded'];
        } else {
            s.panelNumber = (data.panelNumber - 1);
            s.showTutorial = data.showTutorial;
            GameUiService.nextTutorial();
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
            GameUiService.showError('Failed to parse save data. Clearing corrupted save. Error: ' + error.message);
            localStorage.removeItem('data');
            return 'parse_error';
        }
        if (!test) return 'no_data';
        if (test.saveVersion === 'Reset') {
            localStorage.removeItem('data');
            return 'no_data';
        }
        if (test.saveVersion !== scope.state.version) {
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
