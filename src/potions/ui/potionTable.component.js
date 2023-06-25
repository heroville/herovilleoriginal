import app from "../../app";
import template from "./potionTable.html";

app.component("potionTable", {
  template: template,
  controller: function PotionTableController($scope, potions, potion, potionsService,buildingsService) {
    this.potions = potions;
    this.potion = potion;
    this.currentBuilding = buildingsService.findBuilding('alchemist');
    this.create = function (potionid) {
        potionsService.create(potionid);
    };
  }
});