import app from "../../app";
import template from "./resourcesPanel.html";
import "./resourceDisplay.component.js";

app.component("resourcesPanel", {
    template: template,
    controller: function(resources, gold, resourcesService) {
        this.resources = resources;
        this.gold = gold;
        this.incResources = function () {
            resourcesService.incResources();
        };
    }
});