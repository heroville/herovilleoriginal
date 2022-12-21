import app from "../../app";
import dungeonNames from "../data/dungeons.json";

app.service("dungeonService", function DungeonService(dungeons,bossesService,monstersService,gameLoop) {
  var $srvc = this;
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

      this.attemptDungeon = function (dungeonID, hero) {
        var dungeon = dungeons[dungeonID];
        var journey = {
          hero: hero,
          dungeon: dungeon,
          steps: 0,
        };
        // 1 second delay for travelling through dungeon
        setTimeout(function () {
          $srvc.travel(journey);
        }, gameLoop.loopTime);
      };

      this.travel = function (journey) {    
        if (journey.steps == journey.dungeon.steps) {
          for (var i = 0; i < journey.hero.length; i++) {
            journey.hero[i].progress = "Fighting Boss!";
          }
          $scope.bossFight(journey);
        } else {
          // Roll/ for encounter
          var roll = Math.floor(Math.random() * 100 + 1);
          console.log(roll + " " + journey.dungeon.encounterRate);
          if (roll < journey.dungeon.encounterRate) {;    
            $scope.monsterFight(journey);
            for (var i = 0; i < journey.hero.length; i++) {
              journey.hero[i].progress = "Fighting Encounter!";
            }
          } else {
            // if/ there is no fight for that step, take another step and update progress.
            journey.steps++;
            for (var i = 0; i < journey.hero.length; i++) {
              journey.hero[i].progress =
                Math.round((journey.steps / journey.dungeon.steps) * 100) +
                "%" +
                " Complete";
            }
            setTimeout(function () {
              $srvc.travel(journey);
            }, gameLoop.loopTime);
          }
        }
      };
      

});