import app from "../../app";
import template from "./dungeonTable.html";

app.component("dungeonTable", {
    template: template,
    controller: function DungeonTableController(dungeons) {
        this.dungeons = dungeons;
    }
});
