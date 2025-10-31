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
  const g = globalThis;
  const noop = () => undefined;

  const location = (g.location && typeof g.location === 'object') ? g.location : {
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

  const document = (g.document && typeof g.document === 'object') ? g.document : {
    documentElement,
    head: { appendChild: noop },
    body: { appendChild: noop, removeChild: noop },
    createElement: (tagName) => createElementStub(tagName, noop),
    createElementNS: () => ({ style: {} }),
        querySelector: () => null,
        querySelectorAll: () => [],
    getElementsByTagName: () => [],
    addEventListener: noop,
    removeEventListener: noop,
    defaultView: null,
    location,
    baseURI: 'http://localhost/',
    URL: 'http://localhost/'
  };

  const win = (g.window && typeof g.window === 'object') ? g.window : {};
  if (!('document' in win)) win.document = document;
  if (!('location' in win)) win.location = location;
  if (!('navigator' in win)) win.navigator = { userAgent: 'node.js' };
  if (!('history' in win)) win.history = { pushState: noop, replaceState: noop };
    // Minimal DOM constructors expected by Angular's feature detection
    if (!('Node' in win)) {
        win.Node = function Node() {};
    }
    if (!win.Node.prototype) {
        win.Node.prototype = {};
    }
    if (!win.Node.prototype.contains) {
        win.Node.prototype.contains = function () { return false; };
    }
    if (!('Element' in win)) {
        win.Element = function Element() {};
    }
  if (!('name' in win)) win.name = 'nodejs';
  if (!('setTimeout' in win)) win.setTimeout = setTimeout;
  if (!('clearTimeout' in win)) win.clearTimeout = clearTimeout;
  if (!('setInterval' in win)) win.setInterval = setInterval;
  if (!('clearInterval' in win)) win.clearInterval = clearInterval;
  if (!('addEventListener' in win)) win.addEventListener = noop;
  if (!('removeEventListener' in win)) win.removeEventListener = noop;
  if (!('performance' in win)) win.performance = { now: () => Date.now() };

  document.defaultView = win;

  const tryDefine = (name, value) => {
    const desc = Object.getOwnPropertyDescriptor(g, name);
    if (!desc) {
      try { Object.defineProperty(g, name, { value, configurable: true, writable: true }); } catch {}
    } else if (desc.writable) {
      try { g[name] = value; } catch {}
    }
  };

  tryDefine('window', win);
  tryDefine('document', document);
  tryDefine('navigator', win.navigator);
  tryDefine('location', location);
  tryDefine('self', win);
    tryDefine('Node', win.Node);
    tryDefine('Element', win.Element);
}

function ensureAngular() {
    if (angularLoaded) {
        return globalThis.window.angular;
    }

    ensureBrowserEnvironment();

    const moduleRoot = resolve(__dirname, '../../node_modules');
    const angularPath = resolve(moduleRoot, 'angular/angular.min.js');
    const angularSource = readFileSync(angularPath, 'utf8');
    vm.runInThisContext(angularSource, { filename: 'angular.min.js' });
    // Expose global 'angular' symbol for companion modules that expect it
    globalThis.angular = globalThis.window.angular;

    const loadCompanion = (relativePath, filename) => {
        try {
            const source = readFileSync(resolve(moduleRoot, relativePath), 'utf8');
            vm.runInThisContext(source, { filename });
        }
        catch (error) {
            if (error && error.code !== 'ENOENT') {
                throw error;
            }
        }
    };

    loadCompanion('angular-ui-bootstrap/dist/ui-bootstrap-tpls.js', 'angular-ui-bootstrap.js');
    loadCompanion('angulartics/dist/angulartics.min.js', 'angulartics.min.js');
    loadCompanion('angulartics-google-analytics/dist/angulartics-ga.min.js', 'angulartics-ga.min.js');

    angularLoaded = true;
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
    // Try to use an existing bootstrapped injector first
    try {
        const existing = angular.element(globalThis.document).injector && angular.element(globalThis.document).injector();
        if (existing) return existing;
    } catch {}

    // Bootstrap Angular against the stubbed document to provide $rootElement
    try {
        angular.bootstrap(globalThis.document, dependencies);
        const inj = angular.element(globalThis.document).injector();
        if (inj) return inj;
    } catch (err) {
        // Fallback to manual injector creation (may miss $rootElement-dependent services)
        return angular.injector(dependencies);
    }
}
