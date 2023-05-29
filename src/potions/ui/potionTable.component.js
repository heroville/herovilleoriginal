import app from "../../app";
import template from "./potionTable.html";

app.component("potionTable", {
  template: template,
  controller: function PotionTableController($scope, potions, potion, potionsService) {
    this.potions = potions;
    this.potion = potion;
    this.create = function (potionid) {
        potionsService.create(potionid);
    };
  }
});