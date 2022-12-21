import app from "../../app";
import monsterListJson from "../data/monsterList.json";

app.service("monstersService", function (monsters,monsterList) {

    this.init = function () {
        monsterList.monsters = monsterListJson.monsters;
    };

    this.createMonster = function (level) {
        console.log("Creating Monster");
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

      this.monsterFight = function (journey) {
        var eLevel = journey.dungeon.encounterLevel;
        var validMonsters = [];
        var encounterMonsters = [];
        var monsterCount = 0;
        var currentMonster;
        var currLevel = 0;
        var copyMonsters = monsters.slice();
        for (var i = 0; i < copyMonsters.length; i++) {
          if (
            copyMonsters[i].value >= Math.floor(eLevel / 4) &&
            copyMonsters[i].value <= eLevel
          ) {
            validMonsters[validMonsters.length] = copyMonsters[i];
          }
        }
        while (
          monsterCount < 4 &&
          currLevel < eLevel &&
          eLevel - currLevel >= Math.floor(eLevel / 4)
        ) {
          var reducedMonster = [];
          for (var i = 0; i < validMonsters.length; i++) {
            if (validMonsters[i].value <= eLevel - currLevel) {
              reducedMonster[reducedMonster.length] = validMonsters[i];
            }
          }
          currentMonster = Math.floor(Math.random() * reducedMonster.length);
          var multi = 1;
          if (journey.hero.length > 1) {
            multi = 10;
          }
          encounterMonsters[encounterMonsters.length] = {
            id: encounterMonsters.length,
            name: reducedMonster[currentMonster].name,
            value: reducedMonster[currentMonster].value * multi,
            minDamage: reducedMonster[currentMonster].minDamage * multi,
            maxDamage: reducedMonster[currentMonster].maxDamage * multi,
            health: reducedMonster[currentMonster].health * multi,
            maxHealth: reducedMonster[currentMonster].health * multi,
            low:
              "Junk;j;" +
              parseInt(reducedMonster[currentMonster].value * 3 * multi),
            high:
              "Gold;g;" + parseInt(reducedMonster[currentMonster].value * multi),
          };
          monsterCount++;
          currLevel += reducedMonster[currentMonster].value;
        }
        $scope.startFight(encounterMonsters, journey, false);
      };
});