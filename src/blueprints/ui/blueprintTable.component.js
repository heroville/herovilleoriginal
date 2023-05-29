import app from "../../app";
import template from "./blueprintTable.html";

app.component("blueprintTable", {
  template: template,
  controller: function BlueprintTableController(blueprints, blueprintsService) {
    // Controller logic goes here
    this.blueprints = blueprints;
    this.purchaseBlueprint = function (blueprint) {
        blueprintsService.purchaseBlueprint(blueprint);
    }
    
  }
});