import { before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import GameConfig from '../src/constants/gameConfig.data.js';
import { bootstrapAngular, createInjector } from './utils/angular.js';

function createStorageStub() {
    const store = new Map();
    return {
        getItem(key) {
            return store.has(key) ? store.get(key) : null;
        },
        setItem(key, value) {
            store.set(key, String(value));
        },
        removeItem(key) {
            store.delete(key);
        },
        clear() {
            store.clear();
        },
        _store: store
    };
}

function createJQueryStub() {
    const propStore = new Map();
    const dialogCalls = [];

    function cloneValue(value) {
        if (Array.isArray(value)) {
            return value.map(cloneValue);
        }
        if (value && typeof value === 'object') {
            const result = {};
            for (const [key, inner] of Object.entries(value)) {
                result[key] = cloneValue(inner);
            }
            return result;
        }
        return value;
    }

    function stub(selector) {
        if (selector === global.document || selector === (global.window && global.window.document)) {
            return {
                delegate() { return this; },
                find() { return this; },
                on() { return this; },
                off() { return this; }
            };
        }

        const element = {
            dialog(...args) {
                dialogCalls.push({ selector, args });
                return element;
            },
            prop(name, value) {
                const key = `${selector}:${name}`;
                if (value === undefined) {
                    return propStore.has(key) ? propStore.get(key) : false;
                }
                propStore.set(key, value);
                return element;
            },
            val(value) {
                const key = `${selector}:val`;
                if (value === undefined) {
                    return propStore.get(key) ?? '';
                }
                propStore.set(key, value);
                return element;
            },
            hide() { return element; },
            show() { return element; },
            remove() { return element; },
            append() { return element; },
            find() { return element; },
            eq() { return element; },
            trigger() { return element; },
            on() { return element; },
            off() { return element; }
        };

        return element;
    }

    stub.fn = { dialog() {} };
    stub.ui = { keyCode: { ENTER: 13 } };
    stub.extend = function extend(deep, target, ...sources) {
        if (typeof deep !== 'boolean') {
            sources = [target, ...sources];
            target = deep;
            deep = false;
        }
        const output = target || {};
        for (const source of sources) {
            if (!source) continue;
            for (const [key, value] of Object.entries(source)) {
                if (deep && value && typeof value === 'object') {
                    output[key] = extend(true, Array.isArray(value) ? [] : {}, value);
                } else {
                    output[key] = value;
                }
            }
        }
        return output;
    };
    stub.__dialogCalls = dialogCalls;
    stub.__propStore = propStore;
    stub.__clone = cloneValue;
    return stub;
}

function createHttpStub() {
    return {
        get() {
            return {
                then(resolve, reject) {
                    if (typeof resolve === 'function') {
                        resolve({ data: [] });
                    }
                    if (typeof reject === 'function') {
                        // noop
                    }
                    return this;
                },
                catch() {
                    return this;
                }
            };
        }
    };
}

function createTimeoutStub() {
    const queue = [];
    function $timeout(fn) {
        queue.push(fn);
        return { $$timeoutId: queue.length };
    }
    $timeout.flush = () => {
        while (queue.length) {
            const task = queue.shift();
            if (typeof task === 'function') {
                task();
            }
        }
    };
    $timeout.cancel = () => {};
    return $timeout;
}

function buildSnapshotFromScope(scope, heroTable = false) {
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
        heroTable,
        success: scope.successCount.amount,
        losses: scope.lossCount.amount,
        party: scope.party,
        gameStats: scope.gameStats,
        panelNumber: scope.panelNumber,
        showTutorial: scope.showTutorial
    }));
}

describe('MainController save state integration', () => {
    let injector;
    let SaveStateService;
    let $controller;
    let $rootScope;
    let jqueryStub;

    before(async () => {
        jqueryStub = createJQueryStub();
        const storage = createStorageStub();

        if (!global.window) {
            global.window = {};
        }
        global.window.localStorage = storage;
        global.window.location = global.window.location || {};
        global.window.location.reload = () => {};
        global.window.$ = jqueryStub;
        global.window.jQuery = jqueryStub;
        global.localStorage = storage;
        global.$ = jqueryStub;
        global.jQuery = jqueryStub;
        if (global.document && !global.document.getElementById) {
            global.document.getElementById = () => ({ innerHTML: '' });
        }

        await bootstrapAngular({
            modules: [
                'src/controllers/gameConfig.constant.js',
                'src/controllers/economy.service.js',
                'src/controllers/save-state.service.js',
                'src/controllers/maincontroller.js'
            ]
        });
        injector = createInjector();
        SaveStateService = injector.get('SaveStateService');
        $controller = injector.get('$controller');
        $rootScope = injector.get('$rootScope');
    });

    beforeEach(() => {
        jqueryStub.__dialogCalls.length = 0;
        jqueryStub.__propStore.clear();
    });

    it('delegates save snapshots to SaveStateService using the legacy format', () => {
        const $scope = $rootScope.$new();
        const timeout = createTimeoutStub();
        const http = createHttpStub();

        const savedSnapshots = [];
        const originalSave = SaveStateService.save;
        SaveStateService.save = (snapshot) => {
            savedSnapshots.push(snapshot);
            return true;
        };

        $controller('MainController', {
            $scope,
            $http: http,
            $timeout: timeout
        });

        $scope.save();

        assert.strictEqual(savedSnapshots.length, 1);
        const snapshot = savedSnapshots[0];
        const expected = buildSnapshotFromScope($scope, jqueryStub('#showOld').prop('checked'));
        assert.deepStrictEqual(snapshot, expected);

        SaveStateService.save = originalSave;
    });

    it('loads persisted data through SaveStateService.load()', () => {
        const $scope = $rootScope.$new();
        const timeout = createTimeoutStub();
        const http = createHttpStub();

        $controller('MainController', {
            $scope,
            $http: http,
            $timeout: timeout
        });

        const snapshot = buildSnapshotFromScope($scope, true);
        snapshot.resources = 77;
        snapshot.gold = 33;
        snapshot.maxResources = 150;
        snapshot.maxGold = 120;
        snapshot.buildings[0].count = 5;
        snapshot.blueprints[0].enabled = true;
        snapshot.upgrades[0].enabled = false;
        snapshot.jobs[0].enabled = false;
        snapshot.potions = snapshot.potions.map((potion) => ({ ...potion, enabled: true }));
        snapshot.success = 9;
        snapshot.losses = 2;
        snapshot.panelNumber = 4;
        snapshot.showTutorial = false;
        snapshot.gameStats = { ...snapshot.gameStats, clicks: 42 };
        snapshot.heroList = [
            {
                name: 'Hero',
                academy: { id: GameConfig.heroClasses[0].id },
                job: { current: 1 },
                autoAdventure: true
            }
        ];

        const loadCalls = [];
        const originalLoad = SaveStateService.load;
        const originalLoadData = SaveStateService.loadData;
        SaveStateService.load = (options) => {
            loadCalls.push(options);
            return { data: snapshot, incompatible: false, forceReset: Boolean(options && options.forceReset) };
        };
        SaveStateService.loadData = () => snapshot;

        timeout.flush();

        assert.strictEqual(loadCalls.length, 1);
        assert.deepStrictEqual(loadCalls[0], { currentVersion: $scope.version, forceReset: $scope.forceReset });
        assert.strictEqual($scope.resources, snapshot.resources);
        assert.strictEqual($scope.gold, snapshot.gold);
        assert.strictEqual($scope.maxResources, snapshot.maxResources);
        assert.strictEqual($scope.maxGold, snapshot.maxGold);
        assert.strictEqual($scope.buildings[0].count, snapshot.buildings[0].count);
        assert.strictEqual($scope.blueprints[0].enabled, true);
        assert.strictEqual($scope.jobs[0].enabled, false);
        assert.strictEqual($scope.successCount.amount, snapshot.success);
        assert.strictEqual($scope.lossCount.amount, snapshot.losses);
        assert.strictEqual(jqueryStub('#showOld').prop('checked'), true);

        SaveStateService.load = originalLoad;
        SaveStateService.loadData = originalLoadData;
    });

    it('opens the loading dialog when SaveStateService reports an incompatible save', () => {
        const $scope = $rootScope.$new();
        const timeout = createTimeoutStub();
        const http = createHttpStub();

        $controller('MainController', {
            $scope,
            $http: http,
            $timeout: timeout
        });

        jqueryStub.__dialogCalls.length = 0;
        $rootScope.$broadcast(SaveStateService.EVENTS.INCOMPATIBLE, { snapshot: {} });

        const opened = jqueryStub.__dialogCalls.some((call) => call.selector === '#loading' && call.args[0] === 'open');
        assert.ok(opened, 'expected the loading dialog to open');
        assert.strictEqual($scope.pendingIncompatibleSave, false);
    });
});
