import app from "../../app";
import dungeonNames from "../data/dungeons.json";

app.service("dungeonService", function DungeonService(dungeons,bossesService,monstersService) {
  this.dungeonName = function () {
    var dList = dungeonNames.dungeons.slice();
    for (var i = 0; i < dungeons.length; i++) {
      for (var j = 0; j < dList.length; j++) {
        if (dList[j] == dungeons[i].name) {
          dList.splice(j, 1);
        }
      }
    }
    var random = Math.floor(Math.random() * dList.length);
    var name = dList[random];
    return name;
  };

    this.activateDungeon = function () {
        var dungeon = {
          id: dungeons.length,
          name: this.dungeonName(),
          level: dungeons.length + 1,
          steps: 15 * (dungeons.length + 1),
          encounterRate: 15 + Math.floor(Math.random() * 6),
          encounterLevel: dungeons.length + 2,
          bossID: dungeons.length,
          enabled: true,
          reward: "Gold;g;" + (dungeons.length + 1),
        };
        dungeons[dungeons.length] = dungeon;
        monstersService.createMonster(dungeons.length);
        bossesService.createBoss(dungeons.length - 1);
      };

      
});