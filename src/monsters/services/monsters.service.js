import app from "../../app";
import monsterListJson from "../data/monsterList.json";

app.service("monstersService", function (monsters,monsterList) {

    this.init = function () {
        monsterList.monsters = monsterListJson.monsters;
    };

    this.createMonster = function (level) {
        var monstersList = monsterList.monsters;
        for (var i = 0; i < monsters.length; i++) {
          for (var j = 0; j < monstersList.length; j++) {
            if (monstersList[j].name == monsters[i].name) {
              monstersList.splice(j, 1);
            }
          }
        }
        for (var i = 0; i < 3; i++) {
          var random = Math.floor(Math.random() * monstersList.length);
          var randomMax = Math.ceil(Math.random() * (level * level + 1));
          var randomMin = Math.ceil(Math.random() * randomMax);
          var averagedmg = Math.ceil((randomMax + randomMin) / 2);
          var mobHealth = Math.floor(
            ((5 * level) / averagedmg) * (level * level)
          );
          monsters[monsters.length] = {
            id: monsters.length,
            name: monstersList[random].name,
            value: level,
            minDamage: randomMin,
            maxDamage: randomMax,
            health: mobHealth         
          };
          monstersList.splice(random, 1);
        }
      };
});