import './lib/jquery-2.1.1.min.js';
import './lib/jquery-ui-1.10.4.min.js';
import './lib/angular.min.js';
import './lib/angulartics.min.js';
import './lib/angulartics-ga.min.js';
import './lib/ui-bootstrap-tpls.min.js';
import './lib/bootstrap.min.js';

import app from './app.js';
import './controllers/gameConfig.constant.js';
import './controllers/economy.service.js';
import './controllers/maincontroller.js';

const globalJQuery = window.jQuery || window.$;
if (globalJQuery) {
  window.$ = globalJQuery;
  window.jQuery = globalJQuery;
}

export default app;
