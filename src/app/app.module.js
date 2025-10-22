const angular = require('angular');
require('angular-ui-bootstrap');
require('angular-ui-bootstrap/dist/ui-bootstrap-tpls');
require('angulartics');
require('angulartics-google-analytics');

const app = angular.module('Incremental', [
  'ui.bootstrap',
  'angulartics',
  'angulartics.google.analytics',
]);

if (typeof window !== 'undefined') {
  window.app = app;
}

module.exports = app;
module.exports.default = app;
