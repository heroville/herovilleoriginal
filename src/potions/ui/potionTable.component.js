import app from "../../app";
import template from "./potionTable.html";

app.component("potionTable", {
  template: template,
  controller: function PotionTableController($scope, potions, potionsService) {
    this.potions = potions;
    this.incrPotion = function (potion) {
        potionsService.incrPotion(potion);
    };
  }
});