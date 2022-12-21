import app from "../../app";
import heroNameList from "../data/heroName.json";

app.service("heroesService", function HeroesService($mdDialog, heroList, weapons, jobs, heroClass, messageService,dungeonService,dungeons) {

  var $srvc = this;

  this.validHeroName = function (hName) {
    if (hName == "" || hName == null) {
      messageService.showMessage("You must enter a valid name for the hero.");
      return false;
    }
    for (var i = 0; i < heroList.length; i++) {
      if (heroList[i].name == hName) {
        messageService.showMessage("A hero with this name already exists.");
        return false;
      }
    }
    return true;
  };

  this.addHero = function (heroName) {
    var hero = heroList;
    hero[hero.length] = {
      id: hero.length,
      name: heroName,
      currHealth: 100,
      health: 100,
      level: 1,
      experience: 0,
      next: 50,
      equip: {
        weapon: structuredClone(weapons[0]),
        potions: [
          {
            id: 0,
            name: "Regeneration",
            count: 0,
          },
          {
            id: 1,
            name: "Power",
            count: 0,
          },
          {
            id: 2,
            name: "Health",
            count: 0,
          },
          {
            id: 3,
            name: "Good Health",
            count: 0,
          },
          {
            id: 4,
            name: "Great Health",
            count: 0,
          },
        ],
        gold: 0,
        scrap: 0,
      },
      location: "Home",
      progress: 0,
      dungeon: 0,
      clearCount: 0,
      working: false,
      job: jobs[0],
      academy: heroClass[2],
      party: false,
    };
  };

  this.createHero = function () {
    $mdDialog.show({
      template: '<hero-name-modal></hero-name-modal>',
      controller: 'heroNameModalController',
      clickOutsideToClose: true
    }).then(function (result) {
      messageService.showMessage("New hero created.")
      $srvc.addHero(result);
    }, function () {
      messageService.showMessage("New random hero created.")
      $srvc.addHero($srvc.newHeroName());
      $mdDialog.cancel();
    }
    );
  };

  this.newHeroName = function () {
    var randFirst = Math.floor(Math.random() * heroNameList.first.length);
    var newName = heroNameList.first[randFirst];
    newName += " ";
    var randTitle = Math.floor(Math.random() * heroNameList.title.length);
    newName += heroNameList.title[randTitle];
    if ($srvc.validHeroName(newName)) {
      return newName;
    }
    else{
      return $srvc.newHeroName();
    }
    
  };

  this.rest = function () {
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
        this.heal(i, 2, 1);
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

  this.heal = function(heroID, amount, flag) {
    var hero = heroList[heroID];

    if (flag == 1) {
      amount = Math.floor((hero.health / 100) * amount);
    }

    if (hero.currHealth + amount < hero.health) {
      hero.currHealth += amount;
    } else {
      hero.currHealth = hero.health;
    }
  }

});