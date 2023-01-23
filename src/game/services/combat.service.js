import app from "../../app";

app.service("combatService", function (battles, dungeons, combatVar, heroesService, monsters, bosses, messageService,weapons, buildings,gameLoop) {

    var $srvc = this;
  this.startFight = function (monList, journey, boss) {
    var thisBattle = battles.length;
    battles[thisBattle] = {
      id: thisBattle,
      hero: journey.hero,
      copyMonsters: monList.slice(),
      experience: 0,
      boss: boss,
    };
    //activatePotions(journey.hero);
    this.takeTurn(battles[thisBattle], journey);
  };

  this.takeTurn = function (battle, journey) {
    var turnDamage = 0;
    var hero = journey.hero;
    var monstersList = battle.copyMonsters;

    // Start/ of hero turn
    var dead;
    dead = this.heroTurn(hero, monstersList);

    // Start/ of monsters turn

    if (!this.monstersAlive(monstersList)) {
      // Win/ battle what happens?
      //gameStats.wins++;
      for (var i = 1; i < hero.length; i++) {
        heroesService.clearPotions(hero[i]);
      }
      for (var j = 0; j < monstersList.length; j++) {
        for (var i = 0; i < hero.length; i++) {
          if (hero[i].level <= journey.dungeon.level * 2) {
            battle.experience += monstersList[j].value * 5;
          }
        }
      }
      if (battle.boss) {
        for (var i = 0; i < hero.length; i++) {
          if (hero[i].dungeon + 1 < dungeons.length) {
            if (hero[i].clearCount >= combatVar.successCount.amount) {
              hero[i].dungeon++;
              hero[i].clearCount = 0;
            } else {
              hero[i].clearCount++;
            }
          }
          hero[i].location = "Home";
          hero[i].progress = "Resting";
          hero[i].inCombat = false;
          this.addLoot(journey.dungeon.reward, hero[i]);
        }
      } else {
        for (var k = 0; k < hero.length; k++) {
          journey.steps++;
          hero[k].progress =
            Math.round((journey.steps / journey.dungeon.steps) * 100) +
            "%" +
            " Complete";
            hero[k].inCombat = false;
        }
        
      }
      for (var i = 0; i < hero.length; i++) {
        heroesService.gainExp(hero[i], battle.experience);
      }
      console.log("winner");
      battles.splice(battles.indexOf(battle), 1);
      console.log(battles.length);
    } else if (this.enemyTurn(hero, monstersList)) {
      for (var i = 0; i < hero.length; i++) {
        // Lost/ battle what happens?
        battles.splice(battles.indexOf(battle), 1);
        //$scope.gameStats.losses++;
        hero[i].location = "Home";
        hero[i].currHealth = 0;
        hero[i].progress = "Resting";
        hero[i].inCombat = false;
        hero[i].equip.weapon = $.extend(true, {}, weapons[0]);
        heroesService.clearPotions(hero[i]);
        if (buildings[0].tier == 1) {
          hero[i].experience = 0;
          hero[i].equip.scrap = 0;
          hero[i].equip.gold = 0;
          hero[i].level = 1;
          hero[i].next = 50;
          hero[i].health = 100;
          hero[i].dungeon = 0;
          messageService.showMessage(
            "A hero has lost a fight, he has also lost all his progress and must start again."
          );
        } else {
          if (hero[i].dungeon - combatVar.lossCount.amount > 0) {
            hero[i].dungeon -= combatVar.lossCount.amount;
          } else {
            hero[i].dungeon = 0;
          }
          messageService.showMessage(
            "A hero lost a fight, he has respawned in town and must heal before fighting."
          );
        }
        console.log("loser");
      }
    } else {
      setTimeout(function () {
        $srvc.takeTurn(battle, journey);
      }, gameLoop.loopTime);
    }
  };

  this.heroTurn = function (heroL, enemyL) {
    var damage = 0;
    console.log("Arrived in heroTurn");
    for (var i = 0; i < heroL.length; i++) {
      if (heroL[i].currHealth > 0) {
        if (heroL[i].equip.potions[0].active) {
          heal(i, potions[0].value, 1);
        }
        damage += this.heroDamage(heroL[i]);
      }
      console.log("Doing " + damage + " damage");
    }
    var dead = 0;
    for (var i = 0; i < enemyL.length; i++) {
      if (enemyL[i].health == 0) {
        dead++;
      }
    }
    var tempDead = [];
    for (var i = 0; i < enemyL.length; i++) {
      if (enemyL[i].health == 0) {
      } else if (enemyL[i].health < damage) {
        enemyL[i].health = 0;
        tempDead[tempDead.length] = enemyL[i];
        damage = 0;
      } else {
        enemyL[i].health -= damage;
        damage = 0;
      }
    }
    return tempDead;
  };

  this.heroDamage = function (hero) {
    if (hero.equip.weapon.id != weapons[0].id) {
      if (hero.equip.weapon.broken == false) {
        if (hero.equip.weapon.durability <= 0) {
          hero.equip.weapon.minDamage = Math.ceil(
            hero.equip.weapon.minDamage / 2
          );
          hero.equip.weapon.maxDamage = Math.ceil(
            hero.equip.weapon.maxDamage / 2
          );
          hero.equip.weapon.broken = true;
        } else {
          hero.equip.weapon.durability--;
        }
      }

      var min = hero.equip.weapon.minDamage;
      var max = hero.equip.weapon.maxDamage;
      var damage = Math.floor(Math.random() * (max - min + 1)) + min;
      var heroDamageMulti = 1;
      if (hero.equip.potions[1].active == true) {
        heroDamageMulti = 1.5;
      }
      return Math.ceil(damage * $scope.damageMulti * heroDamageMulti);
    } else {
      return 1 //* $scope.damageMulti;
    }
  };

  this.monstersAlive = function (monsterList) {
    var dead = 0;
    for (var i = 0; i < monsterList.length; i++) {
      if (monsterList[i].health <= 0) {
        dead++;
      }
    }
    return monsterList.length != dead;
  };

  // enemy/ Turn
  this.enemyTurn = function (hero, monsterList) {
    var turnDamage = 0;
    for (var i = 0; i < monsterList.length; i++) {
      if (monsterList[i].health > 0) {
        var mobDam = this.enemyDamage(monsterList[i]);
        turnDamage += mobDam;
      }
    }
    console.log("Taking " + turnDamage + " damage");
    var dead = 0;
    for (var k = 0; k < hero.length; k++) {
      if (hero[k].currHealth <= 0) {
        dead++;
      }
    }
    for (var k = 0; k < hero.length; k++) {
      if (hero[k].currHealth <= 0) {
        console.log("Hero is already Dead");
      } else if (hero[k].currHealth <= turnDamage / (hero.length - dead)) {
        hero[k].currHealth = 0;
        console.log("Hero Died");
        dead++;
      } else {
        var heroDamage = Math.floor(turnDamage / (hero.length - dead));
        if (k < heroDamage % (hero.length - dead)) {
          heroDamage++;
        }
        console.log("Taking " + turnDamage + " damage");
        hero[k].currHealth -= heroDamage;
        if (
          hero[k].equip.potions[4].count > 0 &&
          hero[k].health - hero[k].currHealth > potions[4].value
        ) {
          hero[k].equip.potions[4].count--;
          heal(k, potions[4].value);
        } else if (
          hero[k].equip.potions[3].count > 0 &&
          hero[k].health - hero[k].currHealth > potions[3].value
        ) {
          hero[k].equip.potions[3].count--;
          heal(k, potions[3].value);
        } else if (
          hero[k].equip.potions[2].count > 0 &&
          hero[k].health - hero[k].currHealth > potions[2].value
        ) {
          hero[k].equip.potions[2].count--;
          heal(k, potions[2].value);
        }
      }
    }
    return hero.length == dead;
  };

  this.enemyDamage = function (enemy) {
    if (enemy.health <= 0) return 0;
    else {
      var min = enemy.minDamage;
      var max = enemy.maxDamage;
      var damage = Math.floor(Math.random() * (max - min + 1)) + min;
      return damage;
    }
  };

  this.addLoot = function (item, hero) {
    if (item != null) {
      var itemsplit = item.split(";");
      var itemName = itemsplit[0];
      var itemType = itemsplit[1];
      var itemValue = itemsplit[2];
      if (hero.academy.id == 2) {
        itemValue += Math.ceil(itemValue * 0.15);
      }
      console.log(itemType);
      switch (itemType) {
        case "j": {
          hero.equip.scrap += parseInt(itemValue);
          break;
        }
        case "g": {
          hero.equip.gold += parseInt(itemValue);
          break;
        }
      }
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
    this.startFight(encounterMonsters, journey, false);
  };

  this.bossFight = function (journey) {
    var bossID = journey.dungeon.bossID;
    var multi = 1;
    if (journey.hero.length > 1) {
      multi = 10;
    }
    var bossBattle = [
      {
        name: bosses[bossID].name,
        value: bosses[bossID].value * multi,
        minDamage: bosses[bossID].minDamage * multi,
        maxDamage: bosses[bossID].maxDamage * multi,
        health: bosses[bossID].health * multi,
        maxHealth: bosses[bossID].health * multi,
        high: "Junk;j;" + parseInt(bosses[bossID].value * multi * 3),
        low: "Gold;g;" + parseInt(bosses[bossID].value * multi),
      },
    ];
    this.startFight(bossBattle.slice(), journey, true);
  };
});
