import app from "../../app";

app.service("gameLoopService", function (gameLoop, heroesService, dungeonService, heroList, dungeons, buildings, weapons, potions,gold, potion)
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
                  if (heroesService.meetRequirements(hero, weapons[j])) {
                    if (
                      hero.equip.gold >= $scope.weapons[j].sellPrice &&
                      weapons[j].count > 0
                    ) {
                      hero.equip.gold -= weapons[j].sellPrice;
                      weapons[j].count--;
                      goldService.incGold(weapons[j].sellPrice);
                      hero.equip.weapon = $.extend(true, {}, weapons[j]);
                      j = 0;
                    }
                  } else {
                    console.log("Not Allowed");
                  }
                }
              }
              // Buy Replacement
              if (
                (weapon.durability <=
                  weapons[weapon.id].durability * 0.2 ||
                  weapon.minDamage < weapons[weapon.id].minDamage) &&
                hero.equip.gold >= weapon.sellPrice &&
                weapons[weapon.id].count > 0
              ) {
                hero.equip.gold -= weapons[weapon.id].sellPrice;
                weapons[weapon.id].count--;
                hero.equip.weapon = $.extend(true, {}, weapons[weapon.id]);
              }
              for (var j = 0; j < potions.length; j++) {
                var equiped = false;
                for (var k = 0; k < hero.equip.potions.length; k++) {
                  if (
                    hero.equip.potions[k].count < potions[k].maxHero &&
                    hero.equip.gold >= potions[k].sellPrice &&
                    potions[k].count > 0
                  ) {
                    hero.equip.gold -= potions[k].sellPrice;
                    goldService.incGold(potions[k].sellPrice);
                    potions[k].count--;
                    hero.equip.potions[k].count++;
                  }
                }
              }
              // Heal with Potion
              if (
                hero.health - hero.currHealth >= potion.healing &&
                potion.count > 0 &&
                gold.current + potion.sellPrice <= gold.maximum &&
                hero.equip.gold >= potion.sellPrice
              ) {
                hero.equip.gold -= potion.sellPrice;
                goldService.incGold(potion.sellPrice);
                potion.count--;
                heal(i, potion.healing, 1);
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
              resourcesService.incResources(Math.ceil(heroList[i].level / 4) ^ 2);
            }
          }
        }
      };

    
});