const STORAGE_KEY = 'data';
const EVENTS = Object.freeze({
    ERROR: 'SaveState:error',
    SAVED: 'SaveState:saved',
    RESET: 'SaveState:reset',
    INCOMPATIBLE: 'SaveState:incompatible'
});

function SaveStateServiceFactory($window, $rootScope) {
    function ensureStorage() {
        if (!$window || !$window.localStorage) {
            throw new Error('localStorage is not available.');
        }
        return $window.localStorage;
    }

    function broadcast(eventName, payload) {
        $rootScope.$broadcast(eventName, payload || {});
    }

    function readRaw() {
        const storage = ensureStorage();
        const raw = storage.getItem(STORAGE_KEY);
        return typeof raw === 'string' ? raw : null;
    }

    function writeRaw(serialized) {
        ensureStorage().setItem(STORAGE_KEY, serialized);
    }

    function removeRaw() {
        ensureStorage().removeItem(STORAGE_KEY);
    }

    function parseSnapshot(raw, messagePrefix, { clearOnError = true } = {}) {
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw);
        }
        catch (error) {
            if (clearOnError) {
                try {
                    removeRaw();
                }
                catch { /* ignore storage removal errors */ }
            }
            broadcast(EVENTS.ERROR, {
                message: `${messagePrefix}${error.message}`,
                error
            });
            return null;
        }
    }

    function save(stateSnapshot) {
        try {
            const serialized = JSON.stringify(stateSnapshot ?? {});
            writeRaw(serialized);
            broadcast(EVENTS.SAVED, { snapshot: stateSnapshot });
            return true;
        }
        catch (error) {
            broadcast(EVENTS.ERROR, {
                message: `Failed to save game: ${error.message}`,
                error
            });
            return false;
        }
    }

    function loadData() {
        const raw = readRaw();
        return parseSnapshot(raw, 'Failed to load save data. Clearing corrupted save. Error: ');
    }

    function load(options = {}) {
        const raw = readRaw();
        const data = parseSnapshot(raw, 'Failed to parse save data. Clearing corrupted save. Error: ');
        if (!data) {
            return null;
        }

        const { currentVersion, forceReset = false } = options;
        const incompatible = Boolean(currentVersion && data.saveVersion !== currentVersion);

        if (incompatible && !forceReset) {
            broadcast(EVENTS.INCOMPATIBLE, { snapshot: data });
        }

        return {
            data,
            incompatible,
            forceReset: Boolean(forceReset)
        };
    }

    function reset() {
        const raw = readRaw();
        if (!raw) {
            broadcast(EVENTS.ERROR, { message: 'No save data to reset.' });
            return false;
        }

        const data = parseSnapshot(raw, 'Failed to reset save data: ', { clearOnError: true });
        if (!data) {
            return false;
        }

        data.saveVersion = 'Reset';

        try {
            writeRaw(JSON.stringify(data));
        }
        catch (error) {
            broadcast(EVENTS.ERROR, {
                message: `Failed to reset save data: ${error.message}`,
                error
            });
            return false;
        }

        broadcast(EVENTS.RESET, { snapshot: data });
        if ($window && $window.location && typeof $window.location.reload === 'function') {
            try {
                $window.location.reload();
            }
            catch { /* ignore reload errors in tests */ }
        }
        return true;
    }

    return {
        EVENTS,
        save,
        load,
        loadData,
        reset
    };
}

SaveStateServiceFactory.$inject = ['$window', '$rootScope'];

export default SaveStateServiceFactory;
