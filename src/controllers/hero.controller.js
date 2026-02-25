/**
 * Hero tab: hero list, workers, profession change.
 * Inherits heroList, sorting, jobs, etc. from MainController; adds hero-specific actions.
 */
import app from '../app.js';

app.controller('HeroController', function ($scope, HeroService) {
    $scope.heroProfession = HeroService.heroProfession;
});
