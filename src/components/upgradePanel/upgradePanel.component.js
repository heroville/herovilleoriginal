import app from '../../app';
import template from './upgradePanel.html';

app.component('upgradePanel', {
    template: template,
    controller: function UpgradePanelController($scope,upgrades){
        $scope.upgrades = upgrades;
    }
});