import app from "../../app";

app.service("combatService", function (monsters, heroList, messageService, dungeonService, dungeons, gameLoop) {

    this.startFight = function (monList, journey, boss) {
        var thisBattle = $scope.battles.length;
        $scope.battles[thisBattle] = {
          id: thisBattle,
          hero: journey.hero,
          copyMonsters: monList.slice(),
          experience: 0,
          boss: boss,
        };
        //$scope.activatePotions(journey.hero);
        this.takeTurn($scope.battles[thisBattle], journey);
      };

      this.takeTurn = function (battle, journey) {
        var turnDamage = 0;
        var hero = journey.hero;
        var monstersList = battle.copyMonsters;
    
        // Start/ of hero turn
        var dead;
        dead = $scope.heroTurn(hero, monstersList);
    
        // Start/ of monsters turn
    
        if (!$scope.monstersAlive(monstersList)) {
          // Win/ battle what happens?
          $scope.gameStats.wins++;
          for (var i = 1; i < hero.length; i++) {
            $scope.clearPotions(hero[i]);
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
              if (hero[i].dungeon + 1 < $scope.dungeons.length) {
                if (hero[i].clearCount >= $scope.successCount.amount) {
                  hero[i].dungeon++;
                  hero[i].clearCount = 0;
                } else {
                  hero[i].clearCount++;
                }
              }
              hero[i].location = "Home";
              hero[i].progress = "Resting";
              $scope.addLoot(journey.dungeon.reward, hero[i]);
            }
          } else {
            for (var k = 0; k < hero.length; k++) {
              journey.steps++;
              hero[k].progress =
                Math.round((journey.steps / journey.dungeon.steps) * 100) +
                "%" +
                " Complete";
            }
    
            $timeout(function () {
              $scope.travel(journey);
            }, $scope.gameLoop);
          }
          for (var i = 0; i < hero.length; i++) {
            $scope.gainExp(hero[i], battle.experience);
          }
          $scope.debugLog("winner");
          $scope.battles.splice($scope.battles.indexOf(battle), 1);
          $scope.debugLog($scope.battles.length);
        } else if ($scope.enemyTurn(hero, monstersList)) {
          for (var i = 0; i < hero.length; i++) {
            // Lost/ battle what happens?
            $scope.battles.splice($scope.battles.indexOf(battle), 1);
            $scope.gameStats.losses++;
            hero[i].location = "Home";
            hero[i].currHealth = 0;
            hero[i].progress = "Resting";
            hero[i].equip.weapon = $.extend(true, {}, $scope.weapons[0]);
            $scope.clearPotions(hero[i]);
            if ($scope.buildings[0].tier == 1) {
              hero[i].experience = 0;
              hero[i].equip.scrap = 0;
              hero[i].equip.gold = 0;
              hero[i].level = 1;
              hero[i].next = 50;
              hero[i].health = 100;
              hero[i].dungeon = 0;
              $scope.showError(
                "A hero has lost a fight, he has also lost all his progress and must start again."
              );
            } else {
              if (hero[i].dungeon - $scope.lossCount.amount > 0) {
                hero[i].dungeon -= $scope.lossCount.amount;
              } else {
                hero[i].dungeon = 0;
              }
              $scope.showError(
                "A hero lost a fight, he has respawned in town and must heal before fighting."
              );
            }
            $scope.debugLog("loser");
          }
        } else {
          $timeout(function () {
            $scope.takeTurn(battle, journey);
          }, $scope.gameLoop);
        }
      };

    $scope.heroTurn = function (heroL, enemyL) {
        var damage = 0;
        $scope.debugLog("Arrived in heroTurn");
        for (var i = 0; i < heroL.length; i++) {
          if (heroL[i].currHealth > 0) {
            if (heroL[i].equip.potions[0].active) {
              heal(i, $scope.potions[0].value, 1);
            }
            damage += $scope.heroDamage(heroL[i]);
          }
          $scope.debugLog("Doing " + damage + " damage");
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
    
      $scope.heroDamage = function (hero) {
        if (hero.equip.weapon.id != $scope.weapons[0].id) {
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
          return 1 * $scope.damageMulti;
        }
      };
    
      $scope.monstersAlive = function (monsterList) {
        var dead = 0;
        for (var i = 0; i < monsterList.length; i++) {
          if (monsterList[i].health <= 0) {
            dead++;
          }
        }
        return monsterList.length != dead;
      };
    
      // enemy/ Turn
      $scope.enemyTurn = function (hero, monsterList) {
        var turnDamage = 0;
        for (var i = 0; i < monsterList.length; i++) {
          if (monsterList[i].health > 0) {
            var mobDam = $scope.enemyDamage(monsterList[i]);
            turnDamage += mobDam;
          }
        }
        $scope.debugLog("Taking " + turnDamage + " damage");
        var dead = 0;
        for (var k = 0; k < hero.length; k++) {
          if (hero[k].currHealth <= 0) {
            dead++;
          }
        }
        for (var k = 0; k < hero.length; k++) {
          if (hero[k].currHealth <= 0) {
            $scope.debugLog("Hero is already Dead");
          } else if (hero[k].currHealth <= turnDamage / (hero.length - dead)) {
            hero[k].currHealth = 0;
            $scope.debugLog("Hero Died");
            dead++;
          } else {
            var heroDamage = Math.floor(turnDamage / (hero.length - dead));
            if (k < heroDamage % (hero.length - dead)) {
              heroDamage++;
            }
            $scope.debugLog("Taking " + turnDamage + " damage");
            hero[k].currHealth -= heroDamage;
            if (
              hero[k].equip.potions[4].count > 0 &&
              hero[k].health - hero[k].currHealth > $scope.potions[4].value
            ) {
              hero[k].equip.potions[4].count--;
              heal(k, $scope.potions[4].value);
            } else if (
              hero[k].equip.potions[3].count > 0 &&
              hero[k].health - hero[k].currHealth > $scope.potions[3].value
            ) {
              hero[k].equip.potions[3].count--;
              heal(k, $scope.potions[3].value);
            } else if (
              hero[k].equip.potions[2].count > 0 &&
              hero[k].health - hero[k].currHealth > $scope.potions[2].value
            ) {
              hero[k].equip.potions[2].count--;
              heal(k, $scope.potions[2].value);
            }
          }
        }
        return hero.length == dead;
      };
    
      $scope.enemyDamage = function (enemy) {
        if (enemy.health <= 0) return 0;
        else {
          var min = enemy.minDamage;
          var max = enemy.maxDamage;
          var damage = Math.floor(Math.random() * (max - min + 1)) + min;
          return damage;
        }
      };
    
      $scope.addLoot = function (item, hero) {
        if (item != null) {
          var itemsplit = item.split(";");
          var itemName = itemsplit[0];
          var itemType = itemsplit[1];
          var itemValue = itemsplit[2];
          if (hero.academy.id == 2) {
            itemValue += Math.ceil(itemValue * 0.15);
          }
          $scope.debugLog(itemType);
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
    });