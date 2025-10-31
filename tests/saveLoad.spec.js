import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import SaveStateServiceFactory from '../src/services/save-state.service.js';

function createHarness(initialValue) {
    const store = new Map();
    if (initialValue !== undefined) {
        store.set('data', initialValue);
    }

    const localStorage = {
        getItem(key) {
            return store.has(key) ? store.get(key) : null;
        },
        setItem(key, value) {
            store.set(key, String(value));
        },
        removeItem(key) {
            store.delete(key);
        }
    };

    const reloadCalls = [];
    const $window = {
        localStorage,
        location: {
            reload() {
                reloadCalls.push(Date.now());
            }
        }
    };

    const events = [];
    const $rootScope = {
        $broadcast(event, payload) {
            events.push({ event, payload });
        }
    };

    const service = SaveStateServiceFactory($window, $rootScope);

    return { service, store, events, reloadCalls, localStorage };
}

describe('SaveStateService', () => {
    let harness;

    beforeEach(() => {
        harness = createHarness();
    });

    it('persists snapshots and returns them via loadData()', () => {
        const snapshot = { version: '1.3', resources: 42 };

        assert.strictEqual(harness.service.save(snapshot), true);
        assert.strictEqual(harness.store.get('data'), JSON.stringify(snapshot));

        const loaded = harness.service.loadData();
        assert.deepStrictEqual(loaded, snapshot);
        assert.notStrictEqual(loaded, snapshot, 'loadData should return a new object');

        const savedEvent = harness.events.find((evt) => evt.event === harness.service.EVENTS.SAVED);
        assert.ok(savedEvent, 'expected a saved event to be emitted');
    });

    it('removes corrupted saves and reports an error when loadData() fails', () => {
        harness.localStorage.setItem('data', '{');

        const loaded = harness.service.loadData();
        assert.strictEqual(loaded, null);
        assert.strictEqual(harness.store.has('data'), false);

        const errorEvent = harness.events.find((evt) => evt.event === harness.service.EVENTS.ERROR);
        assert.ok(errorEvent, 'expected an error event');
        assert.match(errorEvent.payload.message, /^Failed to load save data\. Clearing corrupted save\./u);
    });

    it('removes corrupted saves and reports an error when load() fails to parse', () => {
        harness.localStorage.setItem('data', 'not-json');

        const loaded = harness.service.load();
        assert.strictEqual(loaded, null);
        assert.strictEqual(harness.store.has('data'), false);

        const errorEvent = harness.events.find((evt) => evt.event === harness.service.EVENTS.ERROR);
        assert.ok(errorEvent, 'expected an error event');
        assert.match(errorEvent.payload.message, /^Failed to parse save data\. Clearing corrupted save\./u);
    });

    it('broadcasts an incompatible event when versions do not match', () => {
        const payload = JSON.stringify({ saveVersion: '1.2', foo: 'bar' });
        harness = createHarness(payload);

        const result = harness.service.load({ currentVersion: '1.3' });
        assert.ok(result);
        assert.strictEqual(result.incompatible, true);
        assert.strictEqual(result.forceReset, false);
        assert.deepStrictEqual(result.data.saveVersion, '1.2');

        const incompatible = harness.events.find((evt) => evt.event === harness.service.EVENTS.INCOMPATIBLE);
        assert.ok(incompatible, 'expected incompatible event');
        assert.deepStrictEqual(incompatible.payload.snapshot.saveVersion, '1.2');

        const withoutEvent = createHarness(payload);
        const secondResult = withoutEvent.service.load({ currentVersion: '1.3', forceReset: true });
        assert.ok(secondResult);
        assert.strictEqual(secondResult.incompatible, true);
        assert.strictEqual(secondResult.forceReset, true);
        const triggered = withoutEvent.events.find((evt) => evt.event === withoutEvent.service.EVENTS.INCOMPATIBLE);
        assert.strictEqual(triggered, undefined, 'forceReset should suppress incompatible events');
    });

    it('resets save data and reloads the location', () => {
        const initial = JSON.stringify({ saveVersion: '1.3', resources: 5 });
        harness = createHarness(initial);

        const didReset = harness.service.reset();
        assert.strictEqual(didReset, true);

        const stored = harness.store.get('data');
        assert.ok(stored);
        const parsed = JSON.parse(stored);
        assert.strictEqual(parsed.saveVersion, 'Reset');

        const resetEvent = harness.events.find((evt) => evt.event === harness.service.EVENTS.RESET);
        assert.ok(resetEvent, 'expected reset event to be emitted');
        assert.strictEqual(harness.reloadCalls.length, 1);
    });

    it('reports an error when reset() is invoked without save data', () => {
        const didReset = harness.service.reset();
        assert.strictEqual(didReset, false);

        const errorEvent = harness.events.find((evt) => evt.event === harness.service.EVENTS.ERROR);
        assert.ok(errorEvent, 'expected an error event');
        assert.strictEqual(errorEvent.payload.message, 'No save data to reset.');
    });
});
