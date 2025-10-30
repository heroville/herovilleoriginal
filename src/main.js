import angular from 'angular';
import jQuery from 'jquery';
import 'jquery-ui-dist/jquery-ui.js';
import 'bootstrap/dist/js/bootstrap.js';
import 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js';
import 'angulartics';
import 'angulartics-google-analytics';

import app from './app.js';
import './controllers/gameConfig.constant.js';
import './controllers/economy.service.js';
import './controllers/maincontroller.js';

window.angular = angular;
window.jQuery = jQuery;
window.$ = jQuery;

export default app;
