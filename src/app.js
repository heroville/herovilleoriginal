import * as heroFilters from './services/heroFilters.js';

const app = window.angular.module('Incremental', ['ngAnimate', 'ui.bootstrap', 'angulartics', 'angulartics.google.analytics']);
window.app = app;

app.value('heroFilters', heroFilters);

app.filter('heroBattle', ['heroFilters', function (heroFilters) {
    return function (items, value) {
        return heroFilters.filterHeroBattle(items, value);
    };
}]);

app.filter('heroWorker', ['heroFilters', function (heroFilters) {
    return function (heroList) {
        return heroFilters.filterHeroWorker(heroList);
    };
}]);

app.filter('heroAdventure', ['heroFilters', function (heroFilters) {
    return function (heroList) {
        return heroFilters.filterHeroAdventure(heroList);
    };
}]);

export default app;



