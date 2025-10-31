import angular from 'angular';
import jQuery from 'jquery';

// Expose globals expected by legacy plugins before loading them
window.angular = angular;
window.jQuery = jQuery;
window.$ = jQuery;

// Ensure jQuery UI/Bootstrap are loaded before Angular controllers run
await Promise.all([
	import('jquery-ui-dist/jquery-ui.js'),
	import('bootstrap/dist/js/bootstrap.js')
]);

// Angular plugins (these expect window.angular to exist)
import 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js';
import 'angulartics';
import 'angulartics-google-analytics';

import app from './app.js';
import './controllers/gameConfig.constant.js';
import './controllers/economy.service.js';
import './controllers/save-state.service.js';
import './controllers/maincontroller.js';



export default app;
