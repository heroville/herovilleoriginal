import app from "../../app";

app.service("bossesService", function (bosses,monsterList) {
    this.createBoss = function (level) {
        level += 2;
        var monstersList = monsterList.monsters;
        for (var i = 0; i < bosses.length; i++) {
          for (var j = 0; j < monstersList.length; j++) {
            if (monstersList[j].name == bosses[i].name) {
              monstersList.splice(j, 1);
            }
          }
        }
    
        var random = Math.floor(Math.random() * monstersList.length);
        var randomMax = Math.ceil(Math.random() * (level * level + 1));
        var randomMin = Math.ceil(Math.random() * randomMax);
        var averagedmg = Math.ceil((randomMax + randomMin) / 2);
        var mobHealth = Math.floor(((5 * level) / averagedmg) * (level * level));
        bosses[bosses.length] = {
          id: bosses.length,
          name: monstersList[random].name,
          value: level,
          minDamage: randomMin,
          maxDamage: randomMax,
          health: mobHealth,
          low: "Junk;j;" + level * 3,
          high: "Gold;g;" + level,
        };
        monstersList.splice(random, 1);
      };   
});