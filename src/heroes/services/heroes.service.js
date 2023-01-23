import app from "../../app";
import heroNameList from "../data/heroName.json";

app.service("heroesService", function HeroesService($mdDialog, heroList, weapons, jobs, heroClass, messageService,dungeons) {

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
      inCombat: false
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

  this.clearPotions = function (hero) {
    for (var i = 1; i < hero.equip.potions.length; i++) {
      if (hero.equip.potions[i].active) {
        hero.equip.potions[i].amount--;
      }
    }
  };

  this.gainExp = function (hero, amount) {
    hero.experience += amount;
    if (hero.experience >= hero.next) {
      hero.level++;
      hero.next += hero.level * 25;
      hero.health += 50;
      hero.experience = 0;

      if (
        hero.level >= 3 &&
        buildings[4].count == 0 &&
        !buildings[4].enabled
      ) {
        $scope.activateBlueprint(2);
      }
      if (
        hero.level >= 10 &&
        $scope.buildings[7].count == 0 &&
        !$scope.buildings[7].enabled
      ) {
        // $scope.activateBlueprint(5);
      }
    }
  };

});