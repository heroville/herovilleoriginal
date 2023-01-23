import app from "../../app";

app.service("gameLoopService", function (gameLoop, heroesService, dungeonService, heroList, dungeons, buildings)
{
    var $srvc = this;
    this.init = function() {
        setInterval($srvc.gameLoop, gameLoop.loopTime);
    }
    this.gameLoop = function()
    {
        $srvc.rest();
        console.log("Game Loop");
    }

    $srvc.rest = function () {
        for (var i = 0; i < heroList.length; i++) {
          var hero = heroList[i];
          var weapon = hero.equip.weapon;
          if (hero.location == "Home") {
            if (hero.equip.gold > 0) {
              // Upgrade Weapon
              if (buildings[3].count > hero.equip.weapon.id) {
                for (
                  var j = buildings[3].count;
                  j > hero.equip.weapon.id;
                  j--
                ) {
                  if ($scope.meetRequirements(hero, $scope.weapons[j])) {
                    if (
                      hero.equip.gold >= $scope.weapons[j].sellPrice &&
                      $scope.weapons[j].count > 0
                    ) {
                      hero.equip.gold -= $scope.weapons[j].sellPrice;
                      $scope.weapons[j].count--;
                      goldService.incGold($scope.weapons[j].sellPrice);
                      hero.equip.weapon = $.extend(true, {}, $scope.weapons[j]);
                      j = 0;
                    }
                  } else {
                    $scope.debugLog("Not Allowed");
                  }
                }
              }
              // Buy Replacement
              if (
                (weapon.durability <=
                  $scope.weapons[weapon.id].durability * 0.2 ||
                  weapon.minDamage < $scope.weapons[weapon.id].minDamage) &&
                hero.equip.gold >= weapon.sellPrice &&
                $scope.weapons[weapon.id].count > 0
              ) {
                hero.equip.gold -= $scope.weapons[weapon.id].sellPrice;
                $scope.weapons[weapon.id].count--;
                hero.equip.weapon = $.extend(true, {}, $scope.weapons[weapon.id]);
              }
              for (var j = 0; j < $scope.potions.length; j++) {
                var equiped = false;
                for (var k = 0; k < hero.equip.potions.length; k++) {
                  if (
                    hero.equip.potions[k].count < $scope.potions[k].maxHero &&
                    hero.equip.gold >= $scope.potions[k].sellPrice &&
                    $scope.potions[k].count > 0
                  ) {
                    hero.equip.gold -= $scope.potions[k].sellPrice;
                    goldService.incGold($scope.potions[k].sellPrice);
                    $scope.potions[k].count--;
                    hero.equip.potions[k].count++;
                  }
                }
              }
              // Heal with Potion
              if (
                hero.health - hero.currHealth >= $scope.potion.healing &&
                $scope.potion.count > 0 &&
                gold.current + $scope.potion.sellPrice <= $scope.maxGold &&
                hero.equip.gold >= $scope.potion.sellPrice
              ) {
                hero.equip.gold -= $scope.potion.sellPrice;
                goldService.incGold($scope.potion.sellPrice);
                $scope.potion.count--;
                heal(i, $scope.potion.healing, 1);
              }
            }
            // Heal the hero "i" for 2% health
            heroesService.heal(i, 2, 1);
            if (
              hero.currHealth == hero.health &&
              (hero.academy.id == 0 || hero.academy.id == 2)
            ) {
              var u = [hero];
              dungeonService.attemptDungeon(hero.dungeon, u);
              hero.location = dungeons[hero.dungeon].name;
            } else if (hero.progress == "Idle") {
              resourcesService.incResources(Math.ceil($scope.heroList[i].level / 4) ^ 2);
            }
          }
        }
      };

    
});