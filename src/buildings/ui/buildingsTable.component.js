import app from "../../app";
import template from "./buildingsTable.html";
app.component("buildingsTable", {
    template: template,
    controller: function BuildingsTableController($scope, buildings,buildingsService) {
        this.buildings = buildings;
        this.incrBuilding = function(building){
            buildingsService.incrBuilding(building);
        }
    },
});