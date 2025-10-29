import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let angularLoaded = false;
let appModuleLoaded = false;

function createElementStub(tagName, noop) {
    const attributes = {};
    let anchorState = null;

    const element = {
        nodeName: tagName.toUpperCase(),
        style: {},
        setAttribute(name, value) {
            attributes[name] = value;
            if (name === 'href' && anchorState) {
                anchorState.update(value);
            }
        },
        getAttribute(name) {
            return attributes[name] ?? null;
        },
        removeAttribute(name) {
            delete attributes[name];
        },
        appendChild: noop,
        removeChild: noop,
        cloneNode() {
            return createElementStub(tagName, noop);
        }
    };

    if (tagName.toLowerCase() === 'a') {
        anchorState = {
            value: new URL('http://localhost/'),
            update(value) {
                this.value = new URL(value, 'http://localhost/');
            }
        };

        Object.defineProperties(element, {
            href: {
                get() {
                    return anchorState.value.href;
                },
                set(value) {
                    anchorState.update(value);
                },
                configurable: true
            },
            protocol: {
                get() {
                    return anchorState.value.protocol;
                }
            },
            host: {
                get() {
                    return anchorState.value.host;
                }
            },
            hostname: {
                get() {
                    return anchorState.value.hostname;
                }
            },
            port: {
                get() {
                    return anchorState.value.port;
                }
            },
            pathname: {
                get() {
                    return anchorState.value.pathname;
                },
                set(value) {
                    anchorState.update(`${anchorState.value.origin}${value}`);
                }
            },
            search: {
                get() {
                    return anchorState.value.search;
                }
            },
            hash: {
                get() {
                    return anchorState.value.hash;
                }
            }
        });

        element.toString = () => anchorState.value.href;
    }

    return element;
}

function ensureBrowserEnvironment() {
    if (globalThis.window) {
        return;
    }

    const noop = () => undefined;
    const location = {
        href: 'http://localhost/',
        protocol: 'http:',
        host: 'localhost',
        port: '80',
        pathname: '/',
        search: '',
        hash: ''
    };

    const documentElement = {
        nodeName: 'HTML',
        style: {},
        appendChild: noop,
        setAttribute: noop,
        getAttribute: () => null
    };

    const document = {
        documentElement,
        head: {
            appendChild: noop
        },
        body: {
            appendChild: noop,
            removeChild: noop
        },
        createElement: (tagName) => createElementStub(tagName, noop),
        createElementNS: () => ({ style: {} }),
        getElementsByTagName: () => [],
        addEventListener: noop,
        removeEventListener: noop,
        defaultView: null,
        location,
        baseURI: 'http://localhost/',
        URL: 'http://localhost/'
    };

    const window = {
        document,
        location,
        navigator: {
            userAgent: 'node.js'
        },
        history: {
            pushState: noop,
            replaceState: noop
        },
        name: 'nodejs',
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        addEventListener: noop,
        removeEventListener: noop,
        performance: {
            now: () => Date.now()
        }
    };

    document.defaultView = window;

    globalThis.window = window;
    globalThis.document = document;
    globalThis.navigator = window.navigator;
    globalThis.location = location;
    globalThis.self = window;
}

function ensureAngular() {
    if (angularLoaded) {
        return globalThis.window.angular;
    }

    ensureBrowserEnvironment();

    const angularPath = resolve(__dirname, '../../src/lib/angular.min.js');
    const angularSource = readFileSync(angularPath, 'utf8');
    vm.runInThisContext(angularSource, { filename: 'angular.min.js' });

    angularLoaded = true;
    globalThis.angular = globalThis.window.angular;
    return globalThis.window.angular;
}

function ensureModule(angular, name) {
    try {
        angular.module(name);
    }
    catch (error) {
        if (/(No module|is not available|\$injector:nomod)/.test(String(error))) {
            angular.module(name, []);
        }
        else {
            throw error;
        }
    }
}

export async function bootstrapAngular({ modules = [] } = {}) {
    const angular = ensureAngular();

    if (!appModuleLoaded) {
        ensureModule(angular, 'ui.bootstrap');
        ensureModule(angular, 'angulartics');
        ensureModule(angular, 'angulartics.google.analytics');

        const appUrl = pathToFileURL(resolve(__dirname, '../../src/app.js')).href;
        await import(appUrl);
        appModuleLoaded = true;
    }

    for (const modulePath of modules) {
        const absolute = resolve(__dirname, '../../', modulePath);
        await import(pathToFileURL(absolute).href);
    }

    return angular;
}

export function createInjector(dependencies = ['ng', 'Incremental']) {
    const angular = ensureAngular();
    return angular.injector(dependencies);
}
