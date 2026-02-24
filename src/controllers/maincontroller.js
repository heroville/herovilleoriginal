import app from '../app.js';

app.controller("MainController", function ($scope, $interval, $timeout, $http, $compile, GameConfig, EconomyService, SaveLoadService, CombatService, DungeonService, HeroService, ProductionService, UiService, UtilService, BuildingService) {
    $scope.dark=false;
    //DEBUG
    $scope.debugging = false;
    $scope.forceReset = true;

    //Initial Variables
    $scope.panel = ["Welcome to Heroville, I will be your guide while you play. (Skip in Options/Help)"];
    $scope.panelNumber = 0;
    $scope.showTutorial = true;
    $scope.panelInfo = false;
    $scope.resources = 0;
    $scope.maxResources = 25;
    $scope.gold = 0;
    $scope.maxGold = 0;
    $scope.incr = 1;
    $scope.restAmount = 2;
    $scope.tempClass = null;
    $scope.tempHero = null;
    $scope.successCount = {
        amount: 3
    };
    $scope.lossCount = {
        amount: 1
    };
    $scope.randomEventTimer = 600000 + Math.floor(Math.random() * 600000);
    $scope.randomE;
    $scope.gameLoop = 1000;
    $scope.damageMulti = 1;
    $scope.goldMulti = 1;

    EconomyService.bindState($scope);
    $scope.incGold = EconomyService.incGold;
    $scope.decGold = EconomyService.decGold;
    $scope.incResources = EconomyService.incResources;
    $scope.decResources = EconomyService.decResources;

    //Display Variables
    $scope.version = '1.3';
    $scope.optionsSuccess = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    $scope.optionsLoss = [1, 2, 3, 4];
    $scope.sorting = {
        heroTable: 'name',
        monList: 'value',
        bossList: 'value',
        heroWork: 'job.id',
        strict: true
    };
    $scope.predicate = 'name';
    $scope.bestiary = false;
    $scope.heroTable = false;  
    $scope.showHeroTable = {};
    $scope.selectedDungeon = 0;
    $scope.heroEnabled = true;
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
        clicks: 0
    }
    
    //Array Variables

    $scope.buildings = angular.copy(GameConfig.buildings);

    $scope.blueprints = angular.copy(GameConfig.blueprints);

    $scope.weapons = angular.copy(GameConfig.weapons);

    $scope.upgrades = [
        {
            id: 0,
            name: 'Bonus Resources I',
            price: 1,
            enabled: true
        },
        {
            id: 1,
            name: 'Save Point',
            price: 3,
            enabled: false
        },
        {
            id: 2,
            name: 'Bonus Resources II',
            price: 5,
            enabled: false
        },
        {
            id: 3,
            name: 'Bonus Resources III',
            price: 20,
            enabled: false
        },
        {
            id: 4,
            name: 'Bonus Resources IV',
            price: 80,
            enabled: false
        },
        {
            id: 5,
            name: 'Bonus Resources V',
            price: 350,
            enabled: false
        },
        {
            id: 6,
            name: 'Bonus Resources VI',
            price: 1000,
            enabled: false
        },
        {
            id: 7,
            name: 'Bonus Resources VII',
            price: 4000,
            enabled: false
        },
        {
            id: 8,
            name: 'Bonus Resources VIII',
            price: 15000,
            enabled: false
        },
        {
            id: 9,
            name: 'Bonus Resources IX',
            price: 45000,
            enabled: false
        },
        {
            id: 10,
            name: 'Bonus Resources X',
            price: 100000,
            enabled: false
        },
        {
            id: 11,
            name: 'Potion Capacity',
            price: 100,
            enabled: false
        },
        {
            id: 12,
            name: 'Potion Capacity II',
            price: 500,
            enabled: false
        },
        {
            id: 13,
            name: 'Potion Capacity III',
            price: 2000,
            enabled: false
        }

    ]

    $scope.jobs = [
        {
            id: 0,
            name: "Gather",
            current: 0,
            limit: 100,
            enabled: true,
            description: "A Gathering hero will collect resources every second."
        },
        {
            id: 1,
            name: "Apothecary",
            current: 0,
            limit: 1,
            enabled: false,
            description: "An Apothecary will make potions."
        },
        {
            id: 2,
            name: "Smith",
            current: 0,
            limit: 1,
            enabled: false,
            description: "A Smith will produce weapons."
        }
    ]

    $scope.potion = {
        id: -1,
        name: "Healing Herbs",
        image: "P_Red04.png",
        healing: 20,
        description: "Restores 20% Health consumed on purchase.",
        count: 0,
        maxCount: 5,
        cost: 10,
        prodTime: 5,
        progress: "Create Potion",
        sellPrice: 1,
        working: 0
    }

    //List of potions with "type" 1: After Combat, 2: On Hero Damage, 3: On Enemy damage, 4: Start of Dungeon
    $scope.potions = angular.copy(GameConfig.potions);

    $scope.events = angular.copy(GameConfig.events);

    $scope.heroClass = angular.copy(GameConfig.heroClasses);

    $http.get('models/heroName.json')
        .then(function (response) {
            $scope.heroName = response.data;
        });

    $http.get('models/monsterList.json')
        .then(function (response) {
            $scope.monsterList = response.data;
        });

    $http.get('models/dungeons.json')
        .then(function (response) {
            $scope.dungeonNames = response.data;
        });


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Game Functions (SAVE/LOAD/RESET) ----------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.reset = function () {
        SaveLoadService.reset($scope);
    };

    $scope.save = function () {
        SaveLoadService.save($scope, { heroTable: $("#showOld").prop("checked") });
    };

    $scope.loadData = function () {
        if (SaveLoadService.loadData($scope) && typeof $ !== 'undefined') {
            $("#showOld").prop("checked", $scope.heroTable);
        }
    };

    $scope.load = function () {
        const result = SaveLoadService.load($scope);
        if (result === 'version_mismatch') {
            $("#loading").dialog("open");
        } else if (result === 'loaded' && typeof $ !== 'undefined') {
            $("#showOld").prop("checked", $scope.heroTable);
        }
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Click Functions --------------------------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.incrRes = function (multi) {
        EconomyService.incrRes(multi);
    };



    $scope.openHeroDialog = function () { $("#dialog").dialog("open"); };
    $scope.openWorkerDialog = function () { $("#dialog2").dialog("open"); };
    $scope.disablePotionButton = function (id) {
        if (id === -1) $('#potionButt').attr('disabled', 'disabled');
        else $('#a' + id).attr('disabled', 'disabled');
    };
    $scope.disableWeaponButton = function (id) { $('#w' + id).attr('disabled', 'disabled'); };

    $scope.incrBuilding = function (building) {
        BuildingService.incrBuilding($scope, building);
    };

    $scope.incrBlueprint = function (blueprint) {
        BuildingService.incrBlueprint($scope, blueprint);
    };




    $scope.purchaseWeapon = function (weapon) {
        ProductionService.purchaseWeapon($scope, weapon);
    };

    $scope.create = function (itemID) {
        ProductionService.create($scope, itemID);
    };

    $scope.activateDungeon = function () {
        DungeonService.activateDungeon($scope);
    };

    $scope.heroProfession = function (selectedJobID, heroID) {
        HeroService.heroProfession($scope, selectedJobID, heroID);
    };

    $scope.heroClassChange = function (selectedClassID, heroID) {
        HeroService.heroClassChange($scope, selectedClassID, heroID);
        $("#confirm").dialog("open");
    };

    $scope.confirmClass = function () {
        HeroService.confirmClass($scope);
    };

    $scope.randomEvent = function (type) {
        $scope.randomEventTimer = 600000 + Math.floor(Math.random() * 600000);
        $scope.showError("You got " + type);
        switch (type) {
            case "Power": {
                $scope.damageMulti = 2;
                $timeout(function () { $scope.damageMulti = 1; }, 300000);
                break;
            }
            case "Wealth": {
                $scope.goldMulti = 2;
                $timeout(function () { $scope.goldMulti = 1; }, 300000);
                break;
            }
            case "Speed": {
                $scope.gameLoop = 500;
                $timeout(function () { $scope.gameLoop = 1000; }, 60000);
                break;
            }
        }
        $timeout(function () {
            $scope.randomE = $scope.events[Math.floor(Math.random() * $scope.events.length)];
            angular.element(document.getElementById('randomTrigger')).append($compile("<div ng-slider remove></div>")($scope));
        }, $scope.randomEventTimer);
    }

    $scope.nextTutorial = function () {
        UiService.nextTutorial($scope);
    };

    $scope.$watch("resources", function (newValue, oldValue) {
        if ($scope.resources == 10 && $scope.panelNumber == 2) {
            $scope.nextTutorial();
        }
    });

    $scope.$watch("gold", function (newValue, oldValue) {
        if ($scope.gold == 1 && $scope.panelNumber == 8) {
            $scope.nextTutorial();
        }
    });
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Game Loops and Hero Logic -----------------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    

    $interval(function () { $scope.work(); $scope.rest(); }, $scope.gameLoop);

    $interval(function () { $scope.save(); }, 30000);

    $timeout(function () {
        $scope.randomE = $scope.events[Math.floor(Math.random() * $scope.events.length)];
        angular.element(document.getElementById('randomTrigger')).append($compile("<div ng-slider remove></div>")($scope));
    }, $scope.randomEventTimer);

    $scope.rest = function () {
        HeroService.rest($scope);
    };

    $scope.work = function () {
        HeroService.work($scope);
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Technical/ and Initialization --------------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    

    $scope.testing = function () {
        $scope.gold = $scope.maxGold;
        $scope.resources = $scope.maxResources;
        for (let i = 0; i < $scope.heroList.length; i++) {
            hero = $scope.heroList[i];
            hero.level++
            hero.next += hero.level * 25;
            hero.health += 50;
            hero.experience = 0;
            if (hero.level >= 10 && $scope.buildings[7].count == 0) {
               // $scope.activateBlueprint(5);
            }
        }
    }

    $scope.testing2 = function () {
        $scope.gold = $scope.maxGold;
        $scope.resources = $scope.maxResources;
       
    }

    
    let init = function () {
        $scope.load();        
    };
    $timeout(function () { init(); },500);

    String.prototype.toHHMMSS = function () {
        let sec_num = parseInt(this, 10); // don't forget the second param
        let hours = Math.floor(sec_num / 3600);
        let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        let seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        let time = hours + ':' + minutes + ':' + seconds;
        return time;
    }

    // Enter/ to confirm Hero Name
    $(document).delegate('.ui-dialog', 'keyup', function (e) {
        let tagName = e.target.tagName.toLowerCase();

        tagName = (tagName === 'input' && e.target.type === 'button') ? 'button' : tagName;

        if (e.which === $.ui.keyCode.ENTER && tagName !== 'textarea' && tagName !== 'select' && tagName !== 'button') {
            $(this).find('.ui-dialog-buttonset button').eq(0).trigger('click');

            return false;
        }
    });

    $scope.showError = function (message) {
        UiService.showError($scope, message);
    };

    $scope.debugLog = function(value) {
        if ($scope.debugging) {
            console.log(value);
        }
    }

    $scope.showVersion = function(){
        $("#version").dialog("open");
    }

    $scope.skipTut = function () {
        UiService.skipTut($scope);
    };

    $scope.startInfo = function () {
        UiService.startInfo($scope);
    };

    // Defer dialog init so jQuery UI doesn't move DOM nodes during Angular's link phase (avoids childNodes undefined error)
    $timeout(function () {
        $("#dialog").dialog({
            closeOnEscape: false,
            open: function (event, ui) {
                $(".ui-dialog-titlebar-close", ui.dialog || ui).hide();
                $("#name").val($scope.newHeroName());
            },
            autoOpen: false,
            modal: true,
            dialogClass: 'heroPopup',
            buttons: {
                'Accept': function () {
                    let hName = $("#name").val();
                    let valid = true;
                    if (hName == "" || hName == null) {
                        document.getElementById("error").innerHTML = "You must enter a valid name for the hero.";
                        valid = false;
                    }
                    for (let i = 0; i < $scope.heroList.length; i++) {
                        if ($scope.heroList[i].name == hName) {
                            valid = false;
                            document.getElementById("error").innerHTML = "A hero with this name already exists."
                        }
                    }
                    if (valid) {
                        $scope.addHero(hName);

                        $(this).dialog('close');
                    }

                }
            }
        });

        $("#dialog2").dialog({
            closeOnEscape: false,
            open: function (event, ui) {
                $(".ui-dialog-titlebar-close", ui.dialog || ui).hide();
                $("#name2").val($scope.newHeroName());
            },
            autoOpen: false,
            modal: true,
            dialogClass: 'workerPopup',
            buttons: {
                'Accept': function () {
                    wName = $("#name2").val();
                    valid = true;
                    if (wName == "" || wName == null) {
                        document.getElementById("error").innerHTML = "You must enter a valid name for the worker.";
                        valid = false;
                    }
                    for (let i = 0; i < $scope.heroList.length; i++) {
                        if ($scope.heroList[i].name == wName) {
                            valid = false;
                            document.getElementById("error").innerHTML = "A worker with this name already exists."
                        }
                    }
                    if (valid) {
                        $scope.addWorker(wName);

                        $(this).dialog('close');
                    }

                }
            }
        });

        $("#loading").dialog({
            closeOnEscape: false,
            open: function (event, ui) {
                $(".ui-dialog-titlebar-close", ui.dialog || ui).hide();
            },
            autoOpen: false,
            modal: true,
            dialogClass: 'loadPopup',
            buttons: {
                'Accept': function () {
                    $scope.loadData();
                    if (typeof $ !== 'undefined') {
                        $("#showOld").prop("checked", $scope.heroTable);
                    }
                    $(this).dialog('close');
                },
                'Cancel': function () {
                    $(this).dialog('close');
                }
            }
        });

        $("#version").dialog({
            closeOnEscape: true,
            open: function (event, ui) {

            },
            autoOpen: false,
            modal: true,
            dialogClass: 'loadPopup',
            buttons: {
                'Close': function () {
                    $(this).dialog('close');
                }

            }
        });

        $("#confirm").dialog({
            autoOpen: false,
            modal: true,
            buttons: {
                "Confirm": function () {
                    $scope.confirmClass();
                    $(this).dialog("close");
                },
                "Cancel": function () {
                    $(this).dialog("close");
                }
            }
        });
    }, 0);

    $(document).ready(function(){
        $("#paypal").click( function() {
            ga('send', 'event', 'Clicks', 'Paypal');
        });

        $("#reddit").click( function() {
            ga('send', 'event', 'Clicks', 'Reddit');
        });

        $("#patreon").click( function() {
            ga('send', 'event', 'Clicks', 'Patreon');
        });
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Array/ Generation --------------------------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

    $scope.addHero = function (heroName) {
        HeroService.addHero($scope, heroName);
    };

    $scope.addWorker = function (heroName) {
        HeroService.addWorker($scope, heroName);
    };

    $scope.newHeroName = function () {
        return HeroService.newHeroName($scope);
    };

    $scope.createMonster = function (level) {
        DungeonService.createMonster($scope, level);
    };

    $scope.createBoss = function (level) {
        DungeonService.createBoss($scope, level);
    };

    $scope.dungeonName = function () {
        return DungeonService.dungeonName($scope);
    };



    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Combat/ and Adventuring --------------------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

    
    $scope.attemptDungeon = function (dungeonID, hero) {
        DungeonService.attemptDungeon($scope, dungeonID, hero);
    };

    $scope.travel = function (journey) {
        DungeonService.travel($scope, journey);
    };

    $scope.monsterFight = function (journey) {
        DungeonService.monsterFight($scope, journey);
    };

    $scope.bossFight = function (journey) {
        DungeonService.bossFight($scope, journey);
    };

    $scope.startFight = function(monList, journey, boss) {
        CombatService.startFight($scope, monList, journey, boss);
    };

    $scope.activatePotions = function(hero) {
        CombatService.activatePotions(hero);
    };

    $scope.takeTurn = function(battle, journey) {
        CombatService.takeTurn($scope, battle, journey);
    };

    $scope.clearPotions = function(hero) {
        CombatService.clearPotions(hero);
    };

    $scope.heroTurn = function(heroL, enemyL) {
        return CombatService.heroTurn($scope, heroL, enemyL);
    };

    $scope.heroDamage = function(hero) {
        return CombatService.heroDamage($scope, hero);
    };

    $scope.monstersAlive = function(monsterList) {
        return CombatService.monstersAlive(monsterList);
    };

    $scope.enemyTurn = function(hero, monsterList) {
        return CombatService.enemyTurn($scope, hero, monsterList);
    };

    $scope.enemyDamage = function(enemy) {
        return CombatService.enemyDamage(enemy);
    };

    $scope.addLoot = function(item, hero) {
        CombatService.addLoot($scope, item, hero);
    };

    $scope.changeTheme = function () {
        UiService.changeTheme($scope);
    };                          


    

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Production/ --------------------------------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.createPotion = function (button, start, heroID) {
        ProductionService.createPotion($scope, button, start, heroID, function () {
            $('#potionButt').removeAttr('disabled');
        });
    };

    $scope.createPotions = function (potionID, button, start, heroID) {
        ProductionService.createPotions($scope, potionID, button, start, heroID, function () {
            $('#a' + potionID).removeAttr('disabled');
        });
    };

    $scope.buyWeapon = function (weaponID, button, start, heroID) {
        ProductionService.buyWeapon($scope, weaponID, button, start, heroID, function () {
            $('#w' + weaponID).removeAttr('disabled');
        });
    };

    $scope.buyUpgrade = function (upgradeID) {
        ProductionService.buyUpgrade($scope, upgradeID);
    };

    $scope.activateBlueprint = function (value) {
        ProductionService.activateBlueprint($scope, value);
    };



    

    

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Safety/ Function ---------------------------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.gainExp = function (hero, amount) {
        HeroService.gainExp($scope, hero, amount);
    };

    $scope.heal = function (heroID, amount, flag) {
        HeroService.heal($scope, heroID, amount, flag);
    };

    $scope.greaterThan = UtilService.greaterThan;
    $scope.meetRequirements = UtilService.meetRequirements;
});
