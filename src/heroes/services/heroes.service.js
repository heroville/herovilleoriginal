import app from "../../app";

app.service("heroesService", function HeroesService($mdDialog, heroList, weapons, jobs, heroClass, messageService) {

  var $srvc = this;

  this.newHeroName = function () {
    return "Random";
  };

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


});