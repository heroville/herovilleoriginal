/**
 * Load order matters: jQuery global first, then jQuery UI & Bootstrap (use window.$),
 * then Angular stack, then app code.
 */

// 1. jQuery on window before any script that expects it
import './vendor/jquery-global.js';

// 2. jQuery plugins (UMD builds that use window.jQuery)
import 'jquery-ui-dist/jquery-ui.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';

// 3. Angular and Angular modules (Angular 1 sets window.angular in UMD)
import 'angular';
import 'angular-animate';
import 'angular-ui-bootstrap/ui-bootstrap-tpls.min.js';
import 'angulartics';
import 'angulartics-google-analytics';

// 4. Analytics (GA) – keeps index.html structure-only
import './analytics.js';

// 5. App
import app from './app.js';
import './controllers/gameConfig.constant.js';
import './controllers/economy.service.js';
import './controllers/saveLoad.service.js';
import './controllers/combat.service.js';
import './controllers/maincontroller.js';

// Ensure jQuery is still on window for code that uses $ (e.g. maincontroller dialogs)
const globalJQuery = window.jQuery || window.$;
if (globalJQuery) {
  window.$ = globalJQuery;
  window.jQuery = globalJQuery;
}

export default app;
