import app from "../app";

app.controller("MainController", MainController);

function MainController($scope, $interval, $timeout, $http, $compile, buildings,blueprints,jobs,weapons,upgrades,potions,resources,gold, goldService, resourcesService, monstersService, gameLoopService) {
  //DEBUG
  $scope.debugging = true;
  $scope.forceReset = true;

  //Initial Variables
  $scope.panel = [
    "Welcome to Heroville, I will be your guide while you play. (Skip in Options/Help)",
  ];
  $scope.showTutorial = true;
  $scope.panelInfo = false;
  $scope.resources = resources.current;
  $scope.maxResources = resources.max;
  $scope.gold = gold.current;
  $scope.maxGold = gold.max;
  $scope.incr = 1;
  $scope.restAmount = 2;
  $scope.tempClass = null;
  $scope.tempHero = null;
  $scope.successCount = {
    amount: 3,
  };
  $scope.lossCount = {
    amount: 1,
  };
  $scope.randomEventTimer = 600000 + Math.floor(Math.random() * 600000);
  $scope.randomE;
  $scope.gameLoop = 1000;
  $scope.damageMulti = 1;
  $scope.goldMulti = 1;

  //Display Variables
  $scope.version = "1.4";
  $scope.optionsSuccess = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  $scope.optionsLoss = [1, 2, 3, 4];
  $scope.sorting = {
    heroTable: "name",
    monList: "value",
    bossList: "value",
    heroWork: "job.id",
    strict: true,
  };
  $scope.predicate = "name";
  $scope.bestiary = false;
  $scope.heroTable = false;
  $scope.showHeroTable = {};
  $scope.selectedDungeon = 0;
  $scope.prodEnabled = true;
  $scope.upgEnabled = true;
  $scope.beastEnabled = true;
  $scope.hFilterString = $scope.hFilter;
  $scope.heroCollapse = true;

  //Proceedural Variables
  $scope.heroList = [];
  $scope.dungeons = [];
  $scope.monsters = [];
  $scope.bosses = [];
  $scope.party = [];

  //Extra
  $scope.battles = [];
  $scope.journeys = [];
  $scope.bossBattle = [];
  $scope.heroName = null;
  $scope.monsterList = null;
  $scope.dungeonNames = null;
  $scope.gameStats = {
    battles: 0,
    wins: 0,
    losses: 0,
    weaponsAuto: 0,
    weaponsManual: [],
    buffs: 0,
    clicks: 0,
  };

  //Array Variables

  $scope.buildings = buildings;
  $scope.blueprints = blueprints;
  $scope.weapons = weapons;
  $scope.upgrades = upgrades;
  $scope.jobs = jobs;

  $scope.potions = potions;
  $scope.events = [
    {
      type: "Wealth",
      image: require("../images/E_Gold02.png"),
    },
    {
      type: "Power",
      image: require("../images/S_Shadow07.png"),
    },
    {
      type: "Speed",
      image: require("../images/S_Buff11.png"),
    },
  ];
  $scope.heroClass = [
    {
      id: 0,
      name: "None",
    },
    {
      id: 1,
      name: "Labourer",
    },
    {
      id: 2,
      name: "Adventurer",
    },
  ];

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Game Functions (SAVE/LOAD/RESET) ----------------------------------------------------------------------------------------------------------------------------//
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  $scope.reset = function () {
    //TODO: Add confirm dialog.
    var data = JSON.parse(localStorage["data"]);
    data.saveVersion = "Reset";
    localStorage["data"] = JSON.stringify(data);
    location.reload();
  };

  $scope.save = function () {
    var data = {
      resources: $scope.resources,
      maxResources: $scope.maxResources,
      gold: $scope.gold,
      maxGold: $scope.maxGold,
      incr: $scope.incr,
      restAmount: $scope.restAmount,
      buildings: $scope.buildings,
      blueprints: $scope.blueprints,
      heroList: $scope.heroList,
      weapons: $scope.weapons,
      potions: $scope.potions,
      upgrades: $scope.upgrades,
      journeys: $scope.journeys,
      bossBattle: $scope.bossBattle,
      battles: $scope.battles,
      dungeons: $scope.dungeons,
      jobs: $scope.jobs,
      potion: $scope.potion,
      saveVersion: $scope.version,
      monsters: $scope.monsters,
      bosses: $scope.bosses,
      bestiary: $scope.bestiary,
      heroTable: $("#showOld").prop("checked"),
      success: $scope.successCount.amount,
      losses: $scope.lossCount.amount,
      party: $scope.party,
      gameStats: $scope.gameStats,
      showTutorial: $scope.showTutorial,
    };
    localStorage["data"] = JSON.stringify(data);
    $scope.showError("Game has saved");
  };

  $scope.loadData = function () {
    var data = JSON.parse(localStorage["data"]);
    $scope.resources = data.resources;
    $scope.maxResources = data.maxResources;
    $scope.gold = data.gold;
    $scope.maxGold = data.maxGold;
    $scope.incr = data.incr;
    $scope.restAmount = data.restAmount;
    $scope.dungeons = data.dungeons;
    $scope.monsters = data.monsters;
    $scope.bosses = data.bosses;
    for (var i = 0; i < data.buildings.length; i++) {
      $scope.buildings[i].cost = data.buildings[i].cost;
      $scope.buildings[i].count = data.buildings[i].count;
      $scope.buildings[i].tier = data.buildings[i].tier;
      $scope.buildings[i].enabled = data.buildings[i].enabled;
    }
    for (var i = 0; i < data.blueprints.length; i++) {
      $scope.blueprints[i].enabled = data.blueprints[i].enabled;
    }
    for (var i = 0; i < data.upgrades.length; i++) {
      $scope.upgrades[i].enabled = data.upgrades[i].enabled;
    }
    for (var i = 0; i < data.jobs.length; i++) {
      $scope.jobs[i].enabled = data.jobs[i].enabled;
    }
    $scope.heroList = data.heroList;

    for (var i = 0; i < $scope.heroList.length; i++) {
      if (
        $scope.heroList[i].academy.id == 0 ||
        $scope.heroList[i].academy.id == 2
      ) {
        $scope.heroList[i].location = "Home";
        $scope.heroList[i].progress = "Idle";
      } else {
        $scope.heroList[i].progress = "Idle";
      }
      $scope.heroList[i].autoAdventure = false;
      $scope.heroList[i].job.current++;
    }
    for (var i = 0; i < data.weapons.length; i++) {
      $scope.weapons[i].minDamage = data.weapons[i].minDamage;
      $scope.weapons[i].cost = data.weapons[i].cost;
      $scope.weapons[i].durability = data.weapons[i].durability;
      $scope.weapons[i].prodTime = data.weapons[i].prodTime;
      $scope.weapons[i].count = data.weapons[i].count;
      $scope.weapons[i].maxCount = data.weapons[i].maxCount;
      $scope.weapons[i].enabled = data.weapons[i].enabled;
      $scope.weapons[i].working = 0;
    }
    for (var i = 0; i < data.potions.length; i++) {
      $scope.potions[i].enabled = data.potions[i].enabled;
    }
    $scope.potion = data.potion;
    $scope.potion.working = 0;
    $scope.bestiary = data.bestiary;
    if ($scope.buildings[1].count > 0) {
      $scope.prodEnabled = false;
    }
    if ($scope.buildings[4].count > 0) {
      $scope.upgEnabled = false;
    }
    if ($scope.bestiary) {
      $scope.beastEnabled = false;
    }
    $("#showOld").prop("checked", data.heroTable);
    $scope.successCount.amount = data.success;
    $scope.lossCount.amount = data.losses;
    $scope.party = data.party;
    $scope.gameStats = data.gameStats;
    $scope.panel = ["Game successfully loaded"];
  };

  $scope.load = function () {
    var test = JSON.parse(localStorage["data"]);
    if (test) {
      if (test.saveVersion != $scope.version) {
        if ($scope.forceReset) {
          //localStorage.clear();
        } else {
          $("#loading").dialog("open");
        }
      } else {
        $scope.loadData();
      }
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Click Functions --------------------------------------------------------------------------------------------------------------------------------------------//
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //function to increment resources on click
  $scope.incrRes = function (multi) {
    multi = multi || 1;
    $scope.gameStats.clicks++;
    if ($scope.resources + multi < $scope.maxResources) {
      $scope.resources += multi;
    } else {
      $scope.resources = $scope.maxResources;
    }
    $scope.resources = $scope.resources;
  };

  //function to Incrmeent the current building

  

  $scope.incrBlueprint = function (blueprint) {
    if (goldService.decGold(blueprint.cost)) {
      blueprint.enabled = false;
      if (blueprint.buildingID > 0) {
        $scope.buildings[blueprint.buildingID].enabled = true;
        blueprint.cost = 0;
      } else {
        switch (blueprint.buildingID) {
          case -1: {
          }
          case -2: {
            $scope.bestiary = true;
            $scope.beastEnabled = false;
            break;
          }
        }
      }
    } else {
      $scope.showError("You do not have enough Gold");
    }
  };

  $scope.purchaseWeapon = function (weapon) {
    if (
      $scope.weapons[weapon].count + $scope.weapons[weapon].working <
      $scope.weapons[weapon].maxCount
    ) {
      if ($scope.resources >= $scope.weapons[weapon].cost) {
        $("#w" + weapon).attr("disabled", "disabled");
        resourcesService.decResources($scope.weapons[weapon].cost, true);
        $scope.weapons[weapon].working++;
        if ($scope.buildings[0].tier == 1) {
          $scope.upgrades[1].enabled = true;
        }
        if (!($scope.gameStats.weaponsManual[weapon] >= 0)) {
          $scope.gameStats.weaponsManual[weapon] = 0;
        }
        $scope.gameStats.weaponsManual[weapon]++;
        $scope.buyWeapon(weapon, true, 0);
      } else {
        $scope.showError("You do not have enough Resources.");
      }
    }
  };



  $scope.heroProfession = function (selectedJobID, heroID) {
    if (
      $scope.heroList.filter((hero) => hero.job.id == selectedJobID).length <
      $scope.jobs[selectedJobID].limit
    ) {
      $scope.jobs[selectedJobID].current++;
      $scope.heroList[heroID].progress = "Idle";
      switch (selectedJobID) {
        case 0: {
          $scope.heroList[heroID].job = $scope.jobs[0];
          break;
        }
        case 1: {
          $scope.heroList[heroID].job = $scope.jobs[1];
          break;
        }
        case 2: {
          $scope.heroList[heroID].job = $scope.jobs[2];
          break;
        }
        case 3: {
          $scope.heroList[heroID].job = $scope.jobs[3];
          break;
        }
      }
    } else {
      $scope.showError(
        "You can not have another hero doing " +
          $scope.jobs[selectedJobID].name +
          "."
      );
    }
  };

  $scope.heroClassChange = function (selectedClassID, heroID) {
    $scope.tempClass = $scope.heroClass[selectedClassID];
    $scope.tempHero = heroID;
    $("#confirm").dialog("open");
  };

  $scope.confirmClass = function () {
    $scope.heroList[$scope.tempHero].academy = $scope.tempClass;
    if ($scope.tempClass.id == 1) {
      $scope.heroList[$scope.tempHero].progress = "Idle";
    }
    $scope.tempClass = null;
    $scope.tempHero = null;
  };

  $scope.randomEvent = function (type) {
    $scope.randomEventTimer = 600000 + Math.floor(Math.random() * 600000);
    $scope.showError("You got " + type);
    switch (type) {
      case "Power": {
        $scope.damageMulti = 2;
        $timeout(function () {
          $scope.damageMulti = 1;
        }, 300000);
        break;
      }
      case "Wealth": {
        $scope.goldMulti = 2;
        $timeout(function () {
          $scope.goldMulti = 1;
        }, 300000);
        break;
      }
      case "Speed": {
        $scope.gameLoop = 500;
        $timeout(function () {
          $scope.gameLoop = 1000;
        }, 60000);
        break;
      }
    }
    $timeout(function () {
      $scope.randomE =
        $scope.events[Math.floor(Math.random() * $scope.events.length)];
      angular
        .element(document.getElementById("randomTrigger"))
        .append($compile("<div ng-slider remove></div>")($scope));
    }, $scope.randomEventTimer);
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Game Loops and Hero Logic -----------------------------------------------------------------------------------------------------------------------------------//
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  $interval(function () {
    $scope.work();
    $scope.rest();
  }, $scope.gameLoop);

  $interval(function () {
    //$scope.save();
  }, 30000);

  $timeout(function () {
    $scope.randomE =
      $scope.events[Math.floor(Math.random() * $scope.events.length)];
    angular
      .element(document.getElementById("randomTrigger"))
      .append($compile("<div ng-slider remove></div>")($scope));
  }, $scope.randomEventTimer);

  $scope.rest = function () {
    for (var i = 0; i < $scope.heroList.length; i++) {
      var hero = $scope.heroList[i];
      var weapon = hero.equip.weapon;
      if (hero.location == "Home") {
        if (hero.equip.gold > 0) {
          // Upgrade Weapon
          if ($scope.buildings[3].count > hero.equip.weapon.id) {
            for (
              var j = $scope.buildings[3].count;
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

          // Buy Potion
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
        heal(i, 2, 1);
        if (
          hero.currHealth == hero.health &&
          (hero.academy.id == 0 || hero.academy.id == 2)
        ) {
          var u = [hero];
          $scope.attemptDungeon(hero.dungeon, u);
          hero.location = $scope.dungeons[hero.dungeon].name;
        } else if (hero.progress == "Idle") {
          resourcesService.incResources(Math.ceil($scope.heroList[i].level / 4) ^ 2);
        }
      }
    }
  };

  $scope.work = function () {
    for (var i = 0; i < $scope.heroList.length; i++) {
      switch ($scope.heroList[i].job.id) {
        case 0: {
          break;
        }
        case 1: {
          if (
            $scope.potion.count + $scope.potion.working <
            $scope.potion.maxCount
          ) {
            if (
              $scope.resources >= $scope.potion.cost &&
              $scope.heroList[i].progress == "Idle"
            ) {
              $scope.resources -= $scope.potion.cost;
              $scope.potion.working++;
              if (!($scope.heroList[i].academy.id == 1)) {
                $scope.createPotion(
                  false,
                  Math.floor(
                    $scope.heroList[i].level * 0.05 * $scope.potion.prodTime
                  ),
                  i
                );
              } else {
                $scope.gainExp(
                  $scope.heroList[i],
                  Math.ceil($scope.potion.prodTime / 2)
                );
                $scope.createPotion(
                  false,
                  Math.floor(
                    $scope.heroList[i].level * 0.05 * $scope.potion.prodTime
                  ),
                  i
                );
              }
            }
          }
          for (var j = 0; j < $scope.potions.length; j++) {
            if (
              $scope.potions[j].enabled &&
              $scope.potions[j].count + $scope.potions[j].working <
                $scope.potions[j].maxCount &&
              $scope.heroList[i].progress == "Idle"
            ) {
              if ($scope.resources >= $scope.potions[j].cost) {
                $scope.potions[j].working++;
                $scope.resources -= $scope.potions[j].cost;
                if (!($scope.heroList[i].academy.id == 1)) {
                  $scope.createPotions(
                    j,
                    false,
                    Math.floor(
                      $scope.heroList[i].level *
                        0.05 *
                        $scope.potions[j].prodTime
                    ),
                    i
                  );
                } else {
                  $scope.gainExp(
                    $scope.heroList[i],
                    Math.ceil($scope.potions[j].prodTime / 2)
                  );
                  $scope.createPotions(
                    j,
                    false,
                    Math.floor(
                      $scope.heroList[i].level *
                        0.05 *
                        $scope.potions[j].prodTime
                    ),
                    i
                  );
                }
              }
            }
          }
          break;
        }
        case 2: {
          for (var j = 0; j < $scope.weapons.length; j++) {
            if (
              $scope.weapons[j].enabled &&
              $scope.weapons[j].count + $scope.weapons[j].working <
                $scope.weapons[j].maxCount &&
              $scope.heroList[i].progress == "Idle"
            ) {
              if ($scope.resources >= $scope.weapons[j].cost) {
                $scope.weapons[j].working++;
                $scope.resources -= $scope.weapons[j].cost;
                if (!($scope.heroList[i].academy.id == 1)) {
                  $scope.gameStats.weaponsAuto++;
                  $scope.buyWeapon(
                    j,
                    false,
                    Math.floor(
                      $scope.heroList[i].level *
                        0.05 *
                        $scope.weapons[j].prodTime
                    ),
                    i
                  );
                } else {
                  $scope.gainExp(
                    $scope.heroList[i],
                    Math.ceil($scope.weapons[j].prodTime / 2)
                  );
                  $scope.gameStats.weaponsAuto++;
                  $scope.buyWeapon(
                    j,
                    false,
                    Math.floor(
                      $scope.heroList[i].level *
                        0.05 *
                        $scope.weapons[j].prodTime
                    ),
                    i
                  );
                }
              }
            }
          }

          break;
        }
        case 3: {
          break;
        }
      }
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Technical/ and Initialization --------------------------------------------------------------------------------------------------------------------------------//
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  $scope.testing = function () {
    gold.current = $scope.maxGold;
    $scope.resources = $scope.maxResources;
    for (var i = 0; i < $scope.heroList.length; i++) {
      hero = $scope.heroList[i];
      hero.level++;
      hero.next += hero.level * 25;
      hero.health += 50;
      hero.experience = 0;
      if (hero.level >= 10 && $scope.buildings[7].count == 0) {
        // $scope.activateBlueprint(5);
      }
    }
  };

  $scope.testing2 = function () {
    $scope.gold = $scope.maxGold;
    $scope.resources = $scope.maxResources;
  };

  var init = function () {
    $scope.load();
  };
  $timeout(function () {
    init();
  }, 500);

  String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - hours * 3600) / 60);
    var seconds = sec_num - hours * 3600 - minutes * 60;

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    var time = hours + ":" + minutes + ":" + seconds;
    return time;
  };

  // Enter/ to confirm Hero Name
  $(document).delegate(".ui-dialog", "keyup", function (e) {
    var tagName = e.target.tagName.toLowerCase();

    tagName =
      tagName === "input" && e.target.type === "button" ? "button" : tagName;

    if (
      e.which === $.ui.keyCode.ENTER &&
      tagName !== "textarea" &&
      tagName !== "select" &&
      tagName !== "button"
    ) {
      $(this).find(".ui-dialog-buttonset button").eq(0).trigger("click");

      return false;
    }
  });



  $scope.debugLog = function (value) {
    if ($scope.debugging) {
      console.log(value);
    }
  };

  $scope.showVersion = function () {
    $("#version").dialog("open");
  };

  $scope.startInfo = function () {
    $scope.panelInfo = true;
  };

  $(document).ready(function () {
    $("#paypal").click(function () {
      ga("send", "event", "Clicks", "Paypal");
    });

    $("#reddit").click(function () {
      ga("send", "event", "Clicks", "Reddit");
    });

    $("#patreon").click(function () {
      ga("send", "event", "Clicks", "Patreon");
    });
  });

  $("#dialog2").dialog({
    closeOnEscape: false,
    open: function (event, ui) {
      $(".ui-dialog-titlebar-close", ui.dialog || ui).hide();
      $("#name2").val($scope.newHeroName());
    },
    autoOpen: false,
    modal: true,
    dialogClass: "workerPopup",
    buttons: {
      Accept: function () {
        var wName = $("#name2").val();
        var valid = true;
        if (wName == "" || wName == null) {
          document.getElementById("error").innerHTML =
            "You must enter a valid name for the worker.";
          valid = false;
        }
        for (var i = 0; i < $scope.heroList.length; i++) {
          if ($scope.heroList[i].name == wName) {
            valid = false;
            document.getElementById("error").innerHTML =
              "A worker with this name already exists.";
          }
        }
        if (valid) {
          $scope.addWorker(wName);

          $(this).dialog("close");
        }
      },
    },
  });

  $("#loading").dialog({
    closeOnEscape: false,
    open: function (event, ui) {
      $(".ui-dialog-titlebar-close", ui.dialog || ui).hide();
    },
    autoOpen: false,
    modal: true,
    dialogClass: "loadPopup",
    buttons: {
      Accept: function () {
        $scope.loadData();
        shouldLoad = true;
        $(this).dialog("close");
      },
      Cancel: function () {
        shouldLoad = true;
        $(this).dialog("close");
      },
    },
  });

  $("#version").dialog({
    closeOnEscape: true,
    open: function (event, ui) {},
    autoOpen: false,
    modal: true,
    dialogClass: "loadPopup",
    buttons: {
      Close: function () {
        $(this).dialog("close");
      },
    },
  });

  $("#confirm").dialog({
    autoOpen: false,
    modal: true,
    buttons: {
      Confirm: function () {
        $scope.confirmClass();
        $(this).dialog("close");
      },
      Cancel: function () {
        $(this).dialog("close");
      },
    },
  });

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Array/ Generation --------------------------------------------------------------------------------------------------------------------------------------------//
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  $scope.addWorker = function (heroName) {
    var hero = $scope.heroList;
    hero[hero.length] = {
      id: hero.length,
      name: heroName,
      currHealth: 100,
      health: 100,
      level: 1,
      experience: 0,
      next: 50,
      equip: {
        weapon: $.extend(true, {}, $scope.weapons[0]),
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
      job: $scope.jobs[0],
      academy: $scope.heroClass[1],
      party: false,
    };
  };

  $scope.newHeroName = function () {
    var randFirst = Math.floor(Math.random() * $scope.heroName.first.length);
    var newName = $scope.heroName.first[randFirst];
    newName += " ";
    var randTitle = Math.floor(Math.random() * $scope.heroName.title.length);
    newName += $scope.heroName.title[randTitle];
    $scope.debugLog(newName);
    var exist = false;
    for (var i = 0; i < $scope.heroList.length; i++) {
      if ($scope.heroList[i].name == newName) {
        exist = true;
      }
    }
    if (exist) {
      newName = $scope.newHeroName();
    }
    return newName;
  };

  





  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Combat/ and Adventuring --------------------------------------------------------------------------------------------------------------------------------------//
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  $scope.attemptDungeon = function (dungeonID, hero) {
    var dungeon = $scope.dungeons[dungeonID];
    var journey = {
      hero: hero,
      dungeon: dungeon,
      steps: 0,
    };
    // 1 second delay for travelling through dungeon
    $timeout(function () {
      $scope.travel(journey);
    }, $scope.gameLoop);
  };

  // function/ invoked on each "step" through a dungeon
  $scope.travel = function (journey) {
    $scope.debugLog("steps:" + journey.steps);

    // if/ steps are at the end of the dungeon fight a boss.
    if (journey.steps == journey.dungeon.steps) {
      for (var i = 0; i < journey.hero.length; i++) {
        journey.hero[i].progress = "Fighting Boss!";
      }
      $scope.bossFight(journey);
    } else {
      // Roll/ for encounter
      var roll = Math.floor(Math.random() * 100 + 1);
      if (roll < journey.dungeon.encounterRate) {
        $scope.debugLog("Encounter Forming");

        // Form/ an encounter of $scope.monsters below "encounter level"

        $scope.monsterFight(journey);
        for (var i = 0; i < journey.hero.length; i++) {
          journey.hero[i].progress = "Fighting Encounter!";
        }
      } else {
        // if/ there is no fight for that step, take another step and update progress.
        journey.steps++;
        for (var i = 0; i < journey.hero.length; i++) {
          journey.hero[i].progress =
            Math.round((journey.steps / journey.dungeon.steps) * 100) +
            "%" +
            " Complete";
        }
        $timeout(function () {
          $scope.travel(journey);
        }, $scope.gameLoop);
      }
    }
  };

  $scope.monsterFight = function (journey) {
    var eLevel = journey.dungeon.encounterLevel;
    var validMonsters = [];
    var encounterMonsters = [];
    var monsterCount = 0;
    var currentMonster;
    var currLevel = 0;
    var copyMonsters = $scope.monsters.slice();
    $scope.debugLog("Encounter Level= " + eLevel);
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



  $scope.startFight = function (monList, journey, boss) {
    var thisBattle = $scope.battles.length;
    $scope.battles[thisBattle] = {
      id: thisBattle,
      hero: journey.hero,
      copyMonsters: monList.slice(),
      experience: 0,
      boss: boss,
    };
    $scope.activatePotions(journey.hero);
    $scope.takeTurn($scope.battles[thisBattle], journey);
  };

  $scope.activatePotions = function (hero) {
    for (var i = 0; i < hero.length; i++) {
      if (hero[i].equip.potions[0].count > 0) {
        hero[i].equip.potions[0].active = true;
      }
      if (hero[i].equip.potions[1].count > 0) {
        hero[i].equip.potions[1].active = true;
      }
    }
  };

  $scope.takeTurn = function (battle, journey) {
    var turnDamage = 0;
    var hero = journey.hero;
    var monstersList = battle.copyMonsters;

    // Start/ of hero turn
    var dead;
    dead = $scope.heroTurn(hero, monstersList);
    $scope.debugLog("Arrived after heroTurn");

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

  $scope.clearPotions = function (hero) {
    for (var i = 1; i < hero.equip.potions.length; i++) {
      if (hero.equip.potions[i].active) {
        hero.equip.potions[i].amount--;
      }
    }
  };

  // Hero/ turn during battle
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

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Production/ --------------------------------------------------------------------------------------------------------------------------------------------------//
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  $scope.buyWeapon = function weapon(weaponID, button, start, heroID) {
    if (heroID != 0) {
      heroID = heroID || -1;
    }
    if ($scope.weapons[weaponID].prodTime > start) {
      if (button) {
        $scope.weapons[weaponID].progress = (
          $scope.weapons[weaponID].prodTime - start
        )
          .toString()
          .toHHMMSS();
      } else if (heroID >= 0) {
        $scope.heroList[heroID].progress = (
          $scope.weapons[weaponID].prodTime - start
        )
          .toString()
          .toHHMMSS();
      }
      setTimeout(function () {
          weapon(weaponID, button, start + 1, heroID);
      }, $scope.gameLoop);
    } else {
      $scope.weapons[weaponID].count++;
      $scope.weapons[weaponID].working--;
      if (button) {
        $scope.weapons[weaponID].progress =
          "Create " + $scope.weapons[weaponID].name;
        $("#w" + weaponID).removeAttr("disabled");
      } else if (heroID >= 0) {
        $scope.heroList[heroID].progress = "Idle";
      }
    }
  };

  $scope.buyUpgrade = function (upgradeID) {
    if ($scope.upgrades[upgradeID].price <= $scope.gold) {
      goldService.decGold($scope.upgrades[upgradeID].price);
      $scope.upgrades[upgradeID].enabled = false;
      switch (upgradeID) {
        case 0: {
          $scope.incr++;
          $scope.upgrades[2].enabled = true;
          break;
        }
        case 1: {
          $scope.buildings[0].tier++;
          $scope.buildings[0].name = "Campsite";
          $scope.restAmount += 3;
          break;
        }
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9: {
          $scope.incr = $scope.incr * 2;
          $scope.upgrades[upgradeID + 1].enabled = true;
          break;
        }
        case 10: {
          $scope.incr = $scope.incr * 2;
          break;
        }
      }
    } else {
      $scope.showError("You do not have enough Gold");
    }
  };

  $scope.activateBlueprint = function (value) {
    if (
      !$scope.blueprints[value].enabled &&
      !$scope.blueprints[value].cost == 0
    ) {
      $scope.blueprints[value].enabled = true;
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Safety/ Function ---------------------------------------------------------------------------------------------------------------------------------------------//
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  $scope.gainExp = function (hero, amount) {
    hero.experience += amount;
    if (hero.experience >= hero.next) {
      hero.level++;
      hero.next += hero.level * 25;
      hero.health += 50;
      hero.experience = 0;

      if (
        hero.level >= 3 &&
        $scope.buildings[4].count == 0 &&
        !$scope.buildings[4].enabled
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

  function heal(heroID, amount, flag) {
    var hero = $scope.heroList[heroID];

    if (flag == 1) {
      amount = Math.floor((hero.health / 100) * amount);
    }

    if (hero.currHealth + amount < hero.health) {
      hero.currHealth += amount;
    } else {
      hero.currHealth = hero.health;
    }
  }

  $scope.greaterThan = function (prop, val) {
    return function (item) {
      if (item[prop] > val) return true;
    };
  };



  //New code
  $scope.init = function(){
    monstersService.init();
    gameLoopService.init();
  }
  $scope.init();
}
