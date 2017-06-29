﻿app.controller("MainController", function ($scope, $interval, $timeout, $http, $compile) {
    
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

    //Display Variables
    $scope.version = '1.2';
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

    $scope.buildings = [
            {
                id: 0,
                name: 'Tent',
                count: 0,
                enabled: true,
                tier: 1,
                cost: 5,
                multiplier: 4,
                description: "This building allows heroes to join the town."
            },
            {
                id: 1,
                name: 'Stockpile',
                count: 0,
                enabled: false,
                tier: 1,
                cost: 25,
                multiplier: 5,
                description: "Adds the Ability to create potions to sell to heroes for gold as well as extending the gold and resource capacities."
            },
            {
                id: 2,
                name: 'Market',
                count: 0,
                enabled: false,
                tier: 1,
                cost: 40,
                multiplier: 10,
                description: "Allows you to purchase blueprints which unlock new buildings."
            },
            {
                id: 3,
                name: 'Blacksmith',
                count: 0,
                enabled: false,
                tier: 1,
                cost: 100,
                multiplier: 5,
                description: "Allows you to construct weapons which can be sold to the hero for gold."
            },
            {
                id: 4,
                name: 'Tavern',
                count: 0,
                tier: 1,
                cost: 150,
                multiplier: 5,
                description: "Allows you to purchase Upgrades giving small bonuses to many different things."
            },
            {
                id: 5,
                name: 'Alchemist',
                count: 0,
                tier: 1,
                cost: 1000,
                multiplier: 5,
                description: "Allows you to construct better potions that provide benefits to the hero."
            },
            {
                id: 6,
                name: 'Dungeons',
                count: 1,
                enabled: false,
                tier: 1,
                cost: 25,
                multiplier: 5,
                description: "Discovers a new Dungeon for your heroes"
            },
            {
                id: 7,
                name: 'Academy',
                count: 0,
                enabled: false,
                tier: 1,
                cost: 10000,
                multiplier: 1,
                description: "Allows heroes to gain a class"
            },
            {
                id: 8,
                name: 'Elite Dungeons',
                count: 0,
                enabled: false,
                tier: 1,
                cost: 35000,
                multiplier: 5,
                description: "Allows parties to adventure into elite dungeons."
            },
            {
                id: 9,
                name: 'Work Hut',
                count: 0,
                enabled: false,
                teir: 1,
                cost: 100,
                multiplier: 4,
                description: "Allows you to train workers and gatherers."
            }
    ]

    $scope.blueprints = [
        {
            id: 0,
            name: 'Blacksmith Blueprint',
            cost: 1,
            buildingID: 3,
            enabled: false,
            description: "Allows you to construct weapons which can be sold to the hero for gold."
        },
        {
            id: 1,
            name: 'Redundant',
            cost: 3,
            buildingID: -1,
            enabled: false,
            description: "Allows a hero to save their progress, when they die in a dungeon they will keep all experience, loot and gold."
        },
        {
            id: 2,
            name: 'Tavern Blueprint',
            cost: 5,
            buildingID: 4,
            enabled: false,
            description: "Allows you to purchase Upgrades giving small bonuses to many different things."
        },
        {
            id: 3,
            name: 'Alchemist Blueprint',
            cost: 10,
            buildingID: 5,
            enabled: false,
            description: "Allows you to construct potions that provide benefits to the hero."
        },
        {
            id: 4,
            name: 'Bestiary',
            cost: 15,
            buildingID: -2,
            enabled: false,
            description: "Enabled the Beastiary where you can see the different types of monsters in this game"
        },
        {
            id: 5,
            name: '',
        },
        {
            id: 6,
            name: '',
        },
        {
            id: 7,
            name: 'Elite Dungeon',
            cost: 25,
            buildingID: 8,
            enabled: false,
            description: "Unlocks dungeons for Parties to explore"
        }
    ]  

    $scope.weapons = [
        {
            id: 0,
            name: 'Fist',
            cost: 0,
            sellPrice: 0,
            minDamage: 1,
            maxDamage: 1,
            durability: 1,
            enabled: false,
            image: "W_Fist001.png",
            progress: "",
            prodTime: 5,
            count: 0,
            maxCount: 5,
            working: 0,
            heroClass: [0]
        },
        {
            id: 1,
            name: 'Dagger',
            cost: 15,
            sellPrice: 1,
            minDamage: 1,
            maxDamage: 3,
            durability: 100,
            enabled: false,
            image: "W_Dagger002.png",
            progress: "Create Dagger",
            prodTime: 5,
            count: 0,
            maxCount: 5,
            working: 0,
            heroClass: [0, 2]
        },
        {
            id: 2,
            name: 'Hand Axe',
            cost: 30,
            sellPrice: 3,
            minDamage: 1,
            maxDamage: 6,
            durability: 100,
            enabled: false,
            image: "W_Axe001.png",
            progress: "Create Hand Axe",
            prodTime: 10,
            count: 0,
            maxCount: 5,
            working: 0,
            heroClass: [2]
        },
        {
            id: 3,
            name: 'Short Sword',
            cost: 50,
            sellPrice: 6,
            minDamage: 1,
            maxDamage: 10,
            durability: 100,
            enabled: false,
            image: "W_Sword001.png",
            progress: "Create Short Sword",
            prodTime: 16,
            count: 0,
            maxCount: 5,
            working: 0,
            heroClass: [2]
        },
        {
            id: 4,
            name: 'Spear',
            cost: 75,
            sellPrice: 10,
            minDamage: 1,
            maxDamage: 15,
            durability: 100,
            enabled: false,
            image: "W_Spear003.png",
            progress: "Create Spear",
            prodTime: 23,
            count: 0,
            maxCount: 5,
            working: 0,
            heroClass: [2]
        },
        {
            id: 5,
            name: 'Mace',
            cost: 105,
            sellPrice: 15,
            minDamage: 1,
            maxDamage: 21,
            durability: 100,
            enabled: false,
            image: "W_Mace004.png",
            progress: "Create Mace",
            prodTime: 31,
            count: 0,
            maxCount: 5,
            working: 0,
            heroClass: [2]
        },
        {
            id: 6,
            name: 'Double Axe',
            cost: 140,
            sellPrice: 21,
            minDamage: 1,
            maxDamage: 28,
            durability: 100,
            enabled: false,
            image: "W_Axe003.png",
            progress: "Create Double Axe",
            prodTime: 40,
            count: 0,
            maxCount: 5,
            working: 0,
            heroClass: [2]
        },
        {
            id: 7,
            name: 'Flail',
            cost: 180,
            sellPrice: 28,
            minDamage: 1,
            maxDamage: 36,
            durability: 100,
            enabled: false,
            image: "W_Mace005.png",
            progress: "Create Flail",
            prodTime: 50,
            count: 0,
            maxCount: 5,
            working: 0,
            heroClass: [2]
        },
        {
            id: 8,
            name: 'Trident',
            cost: 225,
            sellPrice: 36,
            minDamage: 1,
            maxDamage: 45,
            durability: 100,
            enabled: false,
            image: "W_Spear007.png",
            progress: "Create Trident",
            prodTime: 61,
            count: 0,
            maxCount: 5,
            working: 0,
            heroClass: [2]
        },
        {
            id: 9,
            name: 'Dark Blade',
            cost: 275,
            sellPrice: 45,
            minDamage: 1,
            maxDamage: 55,
            durability: 100,
            enabled: false,
            image: "W_Spear014.png",
            progress: "Create Dark Blade",
            prodTime: 73,
            count: 0,
            maxCount: 5,
            working: 0,
            heroClass: [2]
        },
        {
            id: 10,
            name: 'Great Axe',
            cost: 330,
            sellPrice: 55,
            minDamage: 1,
            maxDamage: 66,
            durability: 100,
            enabled: false,
            image: "W_Axe011.png",
            progress: "Create Great Axe",
            prodTime: 86,
            count: 0,
            maxCount: 5,
            working: 0,
            heroClass: [2]
        }
    ]

    //List of potions with "type" 1: After Combat, 2: On Hero Damage, 3: On Enemy damage
    $scope.potions = [
        
    ]

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

    $scope.potions = [
        {
            id: 0,
            name: "Regeneration",
            count: 0,
            maxCount: 5,
            maxHero: 10
        },
        {
            id: 1,
            name: "Power",
            count: 0,
            maxCount: 5,
            maxHero: 10
        },
        {
            id: 2,
            name: "Health",
            count: 0,
            maxCount: 5,
            maxHero: 10
        }
    ]

    $scope.events = [
        {
            type: "Wealth",
            image: "E_Gold02.png"
        },
        {
            type: "Power",
            image: "S_Shadow07.png"
        },
        {
            type: "Speed",
            image: "S_Buff11.png"
        }
    ]

    $scope.heroClass = [
        {
            id: 0,
            name: "None"
        },
        {
            id: 1,
            name: "Labourer"
        },
        {
            id: 2,
            name: "Adventurer"
        }
    ]


    $http.get('Models/heroName.json')
        .success(function (data) {
            $scope.heroName = data;
        });

    $http.get('Models/monsterList.json')
         .success(function (data) {
             $scope.monsterList = data;
         });

    $http.get('Models/dungeons.json')
         .success(function (data) {
             $scope.dungeonNames = data;
         });


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Game Functions (SAVE/LOAD/RESET) ----------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.reset = function () {
        //TODO: Add confirm dialog.
        data = JSON.parse(localStorage["data"]);
        data.saveVersion = "Reset";
        localStorage["data"] = JSON.stringify(data);
        location.reload();
    }


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
            panelNumber: $scope.panelNumber,
            showTutorial: $scope.showTutorial
    }
    localStorage["data"] = JSON.stringify(data);
    $scope.showError("Game has saved");
    }

    $scope.loadData = function () {
        data = JSON.parse(localStorage["data"]);
        $scope.resources = data.resources;
        $scope.maxResources = data.maxResources;
        $scope.gold = data.gold;
        $scope.maxGold = data.maxGold;
        $scope.incr = data.incr;
        $scope.restAmount = data.restAmount;
        $scope.dungeons = data.dungeons;
        $scope.monsters = data.monsters;
        $scope.bosses = data.bosses;
        for (i = 0; i < data.buildings.length; i++) {
            $scope.buildings[i].cost = data.buildings[i].cost;
            $scope.buildings[i].count = data.buildings[i].count;
            $scope.buildings[i].tier = data.buildings[i].tier;
            $scope.buildings[i].enabled = data.buildings[i].enabled;
        }
        for (i = 0; i < data.blueprints.length; i++) {
            $scope.blueprints[i].enabled = data.blueprints[i].enabled;
        }
        for (i = 0; i < data.upgrades.length; i++) {
            $scope.upgrades[i].enabled = data.upgrades[i].enabled;
        }
        for (i = 0; i < data.jobs.length; i++) {
            $scope.jobs[i].enabled = data.jobs[i].enabled;
        }
        $scope.heroList = data.heroList;

        for (i = 0; i < $scope.heroList.length; i++) {
            if ($scope.heroList[i].academy.id == 0 || $scope.heroList[i].academy.id == 2) {
                $scope.heroList[i].location = 'Home';
                $scope.heroList[i].progress = 'Idle';
            }
            else {
                $scope.heroList[i].progress = 'Idle';
            }
            $scope.heroList[i].autoAdventure = false;
            $scope.heroList[i].job.current++;
        }
        for (i = 0; i < data.weapons.length; i++) {
            $scope.weapons[i].minDamage = data.weapons[i].minDamage;
            $scope.weapons[i].cost = data.weapons[i].cost;
            $scope.weapons[i].durability = data.weapons[i].durability;
            $scope.weapons[i].prodTime = data.weapons[i].prodTime;
            $scope.weapons[i].count = data.weapons[i].count;
            $scope.weapons[i].maxCount = data.weapons[i].maxCount;
            $scope.weapons[i].enabled = data.weapons[i].enabled;
            $scope.weapons[i].working = 0;
        }
        $scope.potion = data.potion;
        $scope.potion.working = 0;
        $scope.bestiary = data.bestiary;
        if ($scope.buildings[0].count > 0) {
            $scope.heroEnabled = false;
        }
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
        if (data.panelNumber == 22) {
            $scope.skipTut();
            $scope.panel = ["Game successfully loaded"];
        }
        else {
            $scope.panelNumber = (data.panelNumber - 1);
            $scope.showTutorial = data.showTutorial;
            $scope.nextTutorial();
            
        }
    }

    $scope.load = function () {
        test = JSON.parse(localStorage["data"]);
        if (test) {
            if (test.saveVersion != $scope.version) {
                if ($scope.forceReset) {
                    //localStorage.clear();
                }
                else {
                    $("#loading").dialog("open");
                }

            }
            else {
                $scope.loadData();
            }
        }
        
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Click Functions --------------------------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //function to increment resources on click
    $scope.incrRes = function (multi) {
        multi = multi || 1;
        $scope.gameStats.clicks++;
        if (($scope.resources + multi) < $scope.maxResources) {
            $scope.resources += (multi);

        }
        else {
            $scope.resources = $scope.maxResources;
        }
        $scope.resources = $scope.resources;
    }



    //function to Incrmeent the current building

    $scope.incrBuilding = function (building) {
        if ($scope.decResources(building.cost)) {
            building.count++;
            building.cost = Math.ceil(building.cost + Math.pow((building.count + 1), building.multiplier));
            if (building.id == 0 && $scope.buildings[1].enabled == false) {
                //Enable Town Hall
                $scope.buildings[1].enabled = true;
                $scope.buildings[6].enabled = true;
                //Activate First Dungeon
                $scope.activateDungeon();
                $scope.createMonster(1);
            }
            switch (building.id) {
                //Building Tent
                case 0: {
                    $("#dialog").dialog("open");
                    $scope.heroEnabled = false;
                    if (building.count == 5) {
                        $scope.activateBlueprint(3);
                    }
                    if ($scope.panelNumber == 3) {
                        $scope.nextTutorial();
                    }
                    break;
                }
                    // Building Stockpile
                case 1: {
                    var multip = building.cost;                    
                    $scope.maxResources = building.cost + Math.floor(building.cost / 10);
                    $scope.maxGold = Math.floor(building.cost / 10);
                    if ($scope.buildings[2].count == 0) {
                        $scope.buildings[2].enabled = true;
                        $scope.prodEnabled = false;
                        $scope.jobs[1].enabled = true;
                    }
                    else if ($scope.buildings[4].count == 0) {
                        $scope.activateBlueprint(2);
                    }
                    if ($scope.panelNumber == 6) {
                        $scope.nextTutorial();
                    }
                    break;
                }
                    //Building Market
                case 2: {
                    if (!$scope.buildings[3].enabled) {
                        $scope.blueprints[0].enabled = true;
                        $scope.buildings[2].enabled = false;
                        if ($scope.panelNumber == 13) {
                            $scope.nextTutorial();
                        }
                    }
                    break;
                }
                    //Building Blacksmith
                case 3: {
                    if ($scope.buildings[3].count + 1 < $scope.weapons.length) {
                        $scope.weapons[$scope.buildings[3].count].enabled = true;
                        if ($scope.panelNumber == 15) {
                            $scope.nextTutorial();
                        }
                    }
                    else {
                        $scope.weapons[$scope.buildings[3].count].enabled = true;

                        $scope.buildings[3].enabled = false;
                    }
                    $scope.jobs[2].enabled = true;
                    break;
                }
                    //Build Tavern
                case 4: {
                    $scope.buildings[4].enabled = false;
                    $scope.upgEnabled = false;
                    $scope.buildings[9].enabled = true;

                    if ($scope.panelNumber == 19) {
                        $scope.nextTutorial();
                    }
                    break;
                }
                    //Build Alchemist
                case 5: {

                    break;
                }
                    //Build Dungeon
                case 6: {
                    if ($scope.dungeons.length < 14) {
                        $scope.activateDungeon();
                        if ($scope.panelNumber == 11) {
                            $scope.nextTutorial();
                        }
                    }
                    else {
                        
                        $scope.activateDungeon();
                        $scope.activateBlueprint(4);
                        $scope.buildings[6].enabled = false;
                    }
                    break;
                }
                    //Build Bestiary
                case 7: {
                    $scope.buildings[7].enabled = false;
                }
                case 9: {
                    $("#dialog2").dialog("open");
                }
            }


        }
        else {
            $scope.showError("You do not have enough Resources");
        }
    }

    $scope.incrBlueprint = function (blueprint) {
        if ($scope.decGold(blueprint.cost)) {
            blueprint.enabled = false;
            if (blueprint.buildingID > 0) {
                $scope.buildings[blueprint.buildingID].enabled = true;
                blueprint.cost = 0;
                if ($scope.panelNumber == 14) {
                    $scope.nextTutorial();
                }
            }
            else {
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
        }
        else {
            $scope.showError("You do not have enough Gold");
        }
    }




    $scope.purchaseWeapon = function (weapon) {
        if ($scope.weapons[weapon].count + $scope.weapons[weapon].working < $scope.weapons[weapon].maxCount) {
            if ($scope.resources >= $scope.weapons[weapon].cost) {
                $('#w'+ weapon).attr('disabled','disabled');
                $scope.decResources($scope.weapons[weapon].cost);
                $scope.weapons[weapon].working++;

                if ($scope.panelNumber == 16) {
                    $scope.nextTutorial();
                }
                if ($scope.buildings[0].tier == 1) {
                    $scope.upgrades[1].enabled = true;
                }
                if (!($scope.gameStats.weaponsManual[weapon] >= 0)) {
                    $scope.gameStats.weaponsManual[weapon] = 0;
                }
                $scope.gameStats.weaponsManual[weapon]++;
                $scope.buyWeapon(weapon, true, 0);
            }
            else {
                $scope.showError("You do not have enough Resources.");
            }
        }
    }

    $scope.create = function (itemID) {
        if (itemID == -1) {
            if ($scope.potion.count + $scope.potion.working < $scope.potion.maxCount) {

                if ($scope.resources >= $scope.potion.cost) {
                    if ($scope.panelNumber == 7) {
                        $scope.nextTutorial();
                    }
                    $('#potionButt').attr('disabled', 'disabled');
                    $scope.resources -= $scope.potion.cost;
                    $scope.potion.working++;
                    $scope.createPotion(true, 0);                
                }
                else {
                    $scope.showError("You do not have enough Resources.");
                }
            }

        }
        else {
            if ($scope.potions[itemID].count + $scope.potions[itemID].working < $scope.potions[itemID].maxCount) {
                if ($scope.resources >= $scope.potions[itemID].cost) {
                    $('#a' + itemID).attr('disabled', 'disabled');
                    $scope.decResources($scope.potions[itemID].cost);
                    $scope.potions[itemID].working++;
                    $scope.createPotions(itemID, true, 0);
                }
                else {
                    $scope.showError("You do not have enough Resources.");
                }
            }
        }

    }

    $scope.activateDungeon = function () {
        $scope.dungeons[$scope.dungeons.length] = {
            id: $scope.dungeons.length,
            name: $scope.dungeonName(),
            level: $scope.dungeons.length + 1,
            steps: 15 * ($scope.dungeons.length + 1),
            encounterRate: (15 + Math.floor(Math.random() * 6)),
            encounterLevel: $scope.dungeons.length + 2,
            bossID: $scope.dungeons.length,
            enabled: true,
            reward: ("Gold;g;" + ($scope.dungeons.length + 1))
        }
        $scope.createMonster($scope.dungeons.length);
        $scope.createBoss($scope.dungeons.length - 1);

    }

    $scope.heroProfession = function (selectedJobID, heroID) {
        

        if ($scope.heroList.filter((hero) => hero.job.id == selectedJobID).length < $scope.jobs[selectedJobID].limit) {
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
        }
        else {
            $scope.showError("You can not have another hero doing " + $scope.jobs[selectedJobID].name + ".");
        }
    }

    $scope.heroClassChange = function (selectedClassID, heroID) {
        $scope.tempClass = $scope.heroClass[selectedClassID];
        $scope.tempHero = heroID;
        $("#confirm").dialog("open");

        
    }

    $scope.confirmClass = function () {
        $scope.heroList[$scope.tempHero].academy = $scope.tempClass;
        if ($scope.tempClass.id == 1) {
            $scope.heroList[$scope.tempHero].progress = 'Idle';
        }
        $scope.tempClass = null;
        $scope.tempHero = null;
    }

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

        switch ($scope.panelNumber) {
            case 0: {
                $scope.panel = ["You have been granted control of a new town in an unexplored region of the world. Your job is to attract heroes from all over the land to adventure, work and more importantly spend their gold."];
                $scope.panelNumber++;
                break;
            }
            case 1: {
                $scope.panel = ["To start off you need to begin by gathering the initial resources so that you can build a Tent to attract your first hero. Click the 'Gather' button until you have enough resources to buy a tent. (5 resources)"];
                $scope.panelNumber++;
                $scope.showTutorial = false;
                break;
            }
            case 2: {
                $scope.panel = ["Alright, now click the 'Improve Tent' button to purchase a tent and unlock your first hero. Your heroes name does not affect their playstyle, feel free to name them whatever you want or just keep the default name."];
                $scope.panelNumber++;
                break;
            }
            case 3: {
                $scope.panel = ["Congratulations! You now have your first hero, You can check on your hero by clicking on the newly unlocked 'Hero' tab. This page gives you a quick summary of your heroes. Here you can see their level, health, XP, inventory, location and adventure status. Later you can also see thier profession."];
                $scope.showTutorial = true;
                $scope.panelNumber++;
                break;
            }
            case 4: {
                $scope.panel = ["You may notice that your hero has earnt some gold. If not, they will gain some as they defeat enemies. Unfortunately, your hero is rather reluctant to give you their gold and as a result you need to create items or provide services to encourage them to spend their gold."];
                $scope.panelNumber++;
                break;
            }
            case 5: {
                $scope.panel = ["But, before we get to taking gold from the hero we need the room to store it. For this we need to expand the Stockpile, gather the required resources (25) and press the 'Improve Stockpile' button."];
                $scope.showTutorial = false;
                $scope.panelNumber++;
                break;
            }
            case 6: {
                $scope.panel = ["Alright, the stockpile has room for 5 gold and thankfully also unlocks the first item you can produce for a hero, the potion. Once more you will need to gather the required resources (25) head over to the new 'Production' tab and click on the 'Create Potion' button"];
                $scope.panelNumber++;
                break;
            }
            case 7: {
                $scope.panel = ["The timer will count down the 5 seconds of production time and your first potion will then be created. Once your hero next returns home from an adventure, if they has taken some damage they will purchase the potion for 1 gold. This will heal them for 20% health, but more importanly deposit that gold into your towns inventory."];
                $scope.panelNumber++;
                break;
            }
            case 8: {
                $scope.panel = ["You now have your first gold, I would recommend using it to purchase the first upgrade 'Bonus Resources' which will allow you to gain 2 resources per click instead of 1. This upgrade is located in the 'Upgrades' panel and is purchased by clicking on it. Purchase the 'Bonus Resources' upgrade"];
                $scope.panelNumber++;
                break;
            }
            case 9: {
                $scope.panel = ["Nice work! Purchasing upgrades costs gold and provide a permenant bonus for the game. It is recommended you keep an eye on the available upgrades"];
                $scope.showTutorial = true;
                $scope.panelNumber++;
                break;
            }
            case 10: {
                $scope.panel = ["By now your hero might be close to level 3 and as such has stopped gaining any experience. To fix this he needs to fight in stronger dungeons, back on the 'Town' tab you can see you have a building called 'Dungeons', once again gather the resources required (25) and click the 'Improve Dungeons' button."];
                $scope.showTutorial = false;
                $scope.panelNumber++;
                break;
            }
            case 11: {
                $scope.panel = ["The new dungeon should be visible on the 'Town' tab, your hero will adventure in this dungeon once he has had enough successes in the previous dungeon. It is important to keep upgrading dungeons so that you are able to keep your heroes earning experience."];
                $scope.showTutorial = true;
                $scope.panelNumber++;
                break;
            }
            case 12: {
                $scope.panel = ["Unfortunately, the stronger dungeons are more of a challenge to adventurers and they will have some trouble completing them without a better weapon. So for that we need a 'Blacksmith', but we cant do that at this time first we need a 'Market'. Gather the required resources (40) and click 'Improve Market'."];
                $scope.showTutorial = false;
                $scope.panelNumber++;
                break;
            }
            case 13: {
                $scope.panel = ["Alright, the market unlocks the ability to purchase blueprints for new buildings allowing you to construct them. Head over to the 'Production' tab and you should see the 'Blacksmith Blueprint' is available for 1 gold. If you havn't already, create another potion for your hero to purchase then click 'Buy Blacksmith Blueprint'. While you wait you can create another tent for a second hero."];
                $scope.panelNumber++;
                break;
            }
            case 14: {
                $scope.panel = ["Good Job, you have now unlocked the Blacksmith. Head over to the 'Town' tab and you should now see the Blacksmith listed under buildings. This one is more expensive but certainly worth it. But first, you will need to improve the Stockpile, once you have done that gather the required resources (100) and click 'Improve Blacksmith'."];
                $scope.panelNumber++;
                break;
            }
            case 15: {
                $scope.panel = ["The Blacksmith unlocks weapons for your hero to purchase, head over to the 'Production' tab and you should see the 'Dagger' is now available. Gather the required 15 resources and click 'Create Dagger'."];
                $scope.panelNumber++;
                break;
            }
            case 16: {
                $scope.panel = ["Weapons are required for heroes to be able to clear stronger dungeons, while the dagger is not much better than your fist now later on you can equip weapons that allow to you instantly kill some of the strongest monsters. It is worth noticing that weapons have a durability and every time they strike an enemy it loses one of its durability. If a weapon breaks while a hero is in a dungeon he will only have his fist left to kill the remaining enemies."];
                $scope.showTutorial = true;
                $scope.panelNumber++;
                break;
            }
            case 17: {
                $scope.panel = ["You may have also noticed by now a message appearing that informs you that your hero has lost a fight. Currently when a hero loses they will have to start again from level 1, while it is not a huge issue at the moment at higher levels it can be quite annoying. Fortunately the 'Save Point' upgrade exists, this allows heroes to keep their experience and gold when they lose. Use potions and weapons to earn 3 gold and purchase this upgrade."];
                $scope.showTutorial = false;
                $scope.panelNumber++;
                break;
            }
            case 18: {
                $scope.panel = ["By now you are probably starting to wish there was a better way to collect resources than gathering and I am here to tell you that there is. Once a hero reaches level 5 a new blueprint appears, this is the Tavern blueprint and it unlocks the first tier of classes for your hero 'Adventurer' and 'Labourer'. This Blueprint costs 5 gold, but while you wait you can get more heroes by upgrading the Tent, or more weapons through the Blacksmith. Purchase the Tavern blueprint and then click 'Improve Tavern' (150) on the 'Town' tab."];
                $scope.panelNumber++;
                break;
            }
            case 19: {
                $scope.panel = ["The Tavern unlocks the 'Professions' tab. If you click over to it you will see a list of available professions (Adventurer/Labourer) and any hero you have over level 3 who does not have a profession. If you upgraded the blacksmith you may have noticed there is a profession requirement for the next weapon. If you upgrade your hero to an 'Adventurer' they will be able to equip the new weapon, but more importantly at the moment is the 'Labourer', this allows them to work for your town."];
                $scope.showTutorial = true;
                $scope.panelNumber++;
                break;
            }
            case 20: {
                $scope.panel = ["The labourer will gather resources while idle in town as well as be employed to work for the town and produce items in the 'Production' tab. A labourer can NOT adventure and the change is permenant, so it is recommended to not make all your heroes Labourers. You will gain access to more classes at level 10 with the Academy, each has its own benefits and drawbacks which will be listed on the 'Professions' tab."];
                $scope.panelNumber++;
                break;
            }
            case 21: {
                $scope.panel = ["This is the end of the tutorial for the game. This screen will be replaced by a game log which will display some of the recent game events. There are many more features to unlock and more being added all the time. Enjoy!"];
                $scope.panelNumber++;
                break;
            }
            case 22: {
                $scope.panel = [""];
                $scope.startInfo();
                $scope.showTutorial = false;
            }
        }
        
    }

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

        for (i = 0; i < $scope.heroList.length; i++) {
            hero = $scope.heroList[i];
            weapon = hero.equip.weapon;
            if (hero.location == 'Home') {
                    if (hero.equip.gold > 0) {
                        // Upgrade Weapon
                        if ($scope.buildings[3].count > hero.equip.weapon.id) {
                            for (j = $scope.buildings[3].count; j > hero.equip.weapon.id; j--) {
                                if ($scope.meetRequirements(hero, $scope.weapons[j])) {

                                        if (hero.equip.gold >= $scope.weapons[j].sellPrice && $scope.weapons[j].count > 0) {
                                            hero.equip.gold -= $scope.weapons[j].sellPrice;
                                            $scope.weapons[j].count--;
                                            $scope.incGold($scope.weapons[j].sellPrice);
                                            hero.equip.weapon = $.extend(true, {}, $scope.weapons[j]);
                                            j = 0;
                                        }

                                }
                                else {
                                    $scope.debugLog("Not Allowed");
                                }
                                
                            }
                        }
                        // Buy Replacement
                        if ((weapon.durability <= ($scope.weapons[weapon.id].durability*.2) || weapon.minDamage < $scope.weapons[weapon.id].minDamage) && hero.equip.gold >= weapon.sellPrice && $scope.weapons[weapon.id].count > 0) {
                            hero.equip.gold -= $scope.weapons[weapon.id].sellPrice;
                            $scope.weapons[weapon.id].count--;
                            hero.equip.weapon = $.extend(true, {}, $scope.weapons[weapon.id]);
                        }

                        // Buy Potion
                        for (j = 0; j < $scope.potions.length; j++) {
                            var equiped = false;
                            for (k = 0; k < hero.equip.potions.length; k++) {
                                if (hero.equip.potions[k].count < $scope.potions[k].heroMax && hero.equip.gold >= $scope.potions[k].sellPrice) {
                                    hero.equip.gold -= $scope.potions[k].sellPrice;
                                    $scope.potions[k].count--;
                                    hero.equip.potions[k].count++;
                                }
                            }

                        }
                        // Heal with Potion
                        if ((hero.health - hero.currHealth) >= $scope.potion.healing && $scope.potion.count > 0 && ($scope.gold + $scope.potion.sellPrice) <= $scope.maxGold && hero.equip.gold >= $scope.potion.sellPrice) {

                            hero.equip.gold -= $scope.potion.sellPrice;
                            $scope.incGold($scope.potion.sellPrice);
                            $scope.potion.count--;
                            heal(i, $scope.potion.healing, 1);


                        }

                    }
                    // Heal the hero "i" for 2% health
                    heal(i, 2, 1);
                    if (hero.currHealth == hero.health && (hero.academy.id == 0 || hero.academy.id == 2)) {
                        u = [hero]
                        $scope.attemptDungeon(hero.dungeon, u);
                        hero.location = $scope.dungeons[hero.dungeon].name;
                    }
                    else if(hero.progress == 'Idle'){
                        $scope.incrRes(Math.ceil($scope.heroList[i].level / 4)^2);
                    }
                    
                
            }

        }
    }

    $scope.work = function () {
        for (i = 0; i < $scope.heroList.length; i++) {
            switch ($scope.heroList[i].job.id) {
                case 0: {
                    break;
                }
                case 1: {
                    if (($scope.potion.count + $scope.potion.working) < $scope.potion.maxCount) {

                        if ($scope.resources >= $scope.potion.cost && $scope.heroList[i].progress == "Idle") {
                            $scope.resources -= $scope.potion.cost;
                            $scope.potion.working++;
                            if (!($scope.heroList[i].academy.id == 1)) {
                                $scope.createPotion(false, Math.floor((($scope.heroList[i].level) * .05)*$scope.potion.prodTime), i);
                            }
                            else {
                                $scope.gainExp($scope.heroList[i], Math.ceil($scope.potion.prodTime/2));
                                $scope.createPotion(false, Math.floor((($scope.heroList[i].level) * .05) * $scope.potion.prodTime), i);
                            }
                        }
                    }
                    break;
                }
                case 2: {
                    for (j = 0; j < $scope.weapons.length; j++) {
                        if ($scope.weapons[j].enabled && ($scope.weapons[j].count + $scope.weapons[j].working) < $scope.weapons[j].maxCount && $scope.heroList[i].progress == "Idle") {
                            if ($scope.resources >= $scope.weapons[j].cost) {
                                $scope.weapons[j].working++;
                                $scope.resources -= $scope.weapons[j].cost;
                                if (!($scope.heroList[i].academy.id == 1)) {
                                    $scope.gameStats.weaponsAuto++;
                                    $scope.buyWeapon(j, false, (Math.floor((($scope.heroList[i].level) * .05)*$scope.weapons[j].prodTime)), i);
                                }
                                else {
                                    $scope.gainExp($scope.heroList[i], Math.ceil($scope.weapons[j].prodTime/2));
                                    $scope.gameStats.weaponsAuto++;
                                    $scope.buyWeapon(j, false, (Math.floor((($scope.heroList[i].level) * .05) * $scope.weapons[j].prodTime)), i);
                                }
                            }
                        }
                    }

                    break;
                }
                case 3: {
                    for (j = 0; j < $scope.potions.length; j++) {
                        if ($scope.potions[j].enabled && ($scope.potions[j].count + $scope.potions[j].working) < $scope.potions[j].maxCount && $scope.heroList[i].progress == "Idle") {
                            if ($scope.resources >= $scope.potions[j].cost) {
                                $scope.potions[j].working++;
                                $scope.resources -= $scope.potions[j].cost;
                                if (!($scope.heroList[i].academy.id == 1)) {
                                    $scope.createPotions(j, false, (Math.floor((($scope.heroList[i].level) * .05) * $scope.potions[j].prodTime)), i);
                                }
                                else {
                                    $scope.gainExp($scope.heroList[i], Math.ceil($scope.potions[j].prodTime / 2));
                                    $scope.createPotions(j, false, (Math.floor((($scope.heroList[i].level) * .05) * $scope.potions[j].prodTime)), i);
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Technical/ and Initialization --------------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    

    $scope.testing = function () {
        $scope.gold = $scope.maxGold;
        $scope.resources = $scope.maxResources;
        for (i = 0; i < $scope.heroList.length; i++) {
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

    
    var init = function () {
        $scope.load();        
    };
    $timeout(function () { init(); },500);

    String.prototype.toHHMMSS = function () {
        var sec_num = parseInt(this, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        var time = hours + ':' + minutes + ':' + seconds;
        return time;
    }

    // Enter/ to confirm Hero Name
    $(document).delegate('.ui-dialog', 'keyup', function (e) {
        var tagName = e.target.tagName.toLowerCase();

        tagName = (tagName === 'input' && e.target.type === 'button') ? 'button' : tagName;

        if (e.which === $.ui.keyCode.ENTER && tagName !== 'textarea' && tagName !== 'select' && tagName !== 'button') {
            $(this).find('.ui-dialog-buttonset button').eq(0).trigger('click');

            return false;
        }
    });

    $scope.showError = function(message) {
        document.getElementById("errorDialog").innerHTML = message;
        setTimeout(function () { document.getElementById("errorDialog").innerHTML = "<br />" }, 3000);
        if ($scope.panelInfo) {
            var d = new Date();
            //$scope.panel.unshift(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " : " + message);
            $scope.panel.unshift(d.toTimeString().slice(0, 8) + " : " + message);
            if ($scope.panel.length > 10) {
                $scope.panel.pop();
            }
        }
    }

    $scope.debugLog = function(value) {
        if ($scope.debugging) {
            console.log(value);
        }
    }

    $scope.showVersion = function(){
        $("#version").dialog("open");
    }

    $scope.skipTut = function () {
        $scope.panelNumber = 22;
        $scope.nextTutorial();
    }

    $scope.startInfo = function () {
        $scope.panelInfo = true;
    }

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
                hName = $("#name").val();
                valid = true;
                if (hName == "" || hName == null) {
                    document.getElementById("error").innerHTML = "You must enter a valid name for the hero.";
                    valid = false;
                }
                for (i = 0; i < $scope.heroList.length; i++) {
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
                for (i = 0; i < $scope.heroList.length; i++) {
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
                shouldLoad = true;
                $(this).dialog('close');
            },
            'Cancel': function () {
                shouldLoad = true;
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

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Array/ Generation --------------------------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

    $scope.addHero = function(heroName) {
        var hero = $scope.heroList;
        hero[hero.length] =
            {
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
                            count: 0
                        },
                        {
                            id: 1,
                            name: "Power",
                            count: 0
                        },
                        {
                            id: 2,
                            name: "Health",
                            count: 0
                        }
                    ],
                    gold: 0,
                    scrap: 0,
                },
                location: 'Home',
                progress: 0,
                dungeon: 0,
                clearCount: 0,
                working: false,
                job: $scope.jobs[0],
                academy: $scope.heroClass[2],
                party: false
            }
    }  
    $scope.addWorker = function(heroName) {
        var hero = $scope.heroList;
        hero[hero.length] =
            {
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
                            count: 0
                        },
                        {
                            id: 1,
                            name: "Power",
                            count: 0
                        },
                        {
                            id: 2,
                            name: "Health",
                            count: 0
                        }
                    ],
                    gold: 0,
                    scrap: 0,
                },
                location: 'Home',
                progress: 0,
                dungeon: 0,
                clearCount: 0,
                working: false,
                job: $scope.jobs[0],
                academy: $scope.heroClass[1],
                party: false
            }
    } 

    $scope.newHeroName = function () {
        randFirst = Math.floor(Math.random() * $scope.heroName.first.length);
        newName = $scope.heroName.first[randFirst];
        newName += " ";
        randTitle = Math.floor(Math.random() * $scope.heroName.title.length);
        newName += $scope.heroName.title[randTitle];
        $scope.debugLog(newName);
        exist = false;
        for (i = 0; i < $scope.heroList.length; i++) {
            if ($scope.heroList[i].name == newName) {
                exist = true;
            }
        }
        if (exist) {
            newName = $scope.newHeroName();
        }
        return newName
    }

    $scope.createMonster = function (level) {

        monstersist = $scope.monsterList.monsters;
        for (i = 0; i < $scope.monsters.length; i++) {
            for (j = 0; j < monstersist.length; j++) {
                if (monstersist[j].name == $scope.monsters[i].name) {
                    monstersist.splice(j, 1);
                }
            }
        }
        for (i = 0; i < 3; i++) {
            random = Math.floor(Math.random() * monstersist.length);
            randomMax = Math.ceil(Math.random() * (level*level + 1));
            randomMin = Math.ceil(Math.random() * (randomMax));
            averagedmg = Math.ceil((randomMax + randomMin) / 2);
            mobHealth = Math.floor(((5 * level) / averagedmg) * (level * level));
            $scope.monsters[$scope.monsters.length] = {
                id: $scope.monsters.length,
                name: monstersist[random].name,
                value: level,
                minDamage: randomMin,
                maxDamage: randomMax,
                health: mobHealth,
                low: "Junk;j;" + (level * 3),
                high: "Gold;g;" + level
            }
            $scope.debugLog("Created " + $scope.monsters[($scope.monsters.length - 1)].name);
            monstersist.splice(random, 1);
        }

    }

    $scope.createBoss = function(level) {
        level += 2;
        monstersist = $scope.monsterList.monsters;
        for (i = 0; i < $scope.bosses.length; i++) {
            for (j = 0; j < monstersist.length; j++) {
                if (monstersist[j].name == $scope.bosses[i].name) {
                    monstersist.splice(j, 1);
                }
            }
        }

        random = Math.floor(Math.random() * monstersist.length);
        randomMax = Math.ceil(Math.random() * (level * level + 1));
        randomMin = Math.ceil(Math.random() * (randomMax));
        averagedmg = Math.ceil((randomMax + randomMin) / 2);
        mobHealth = Math.floor(((5 * level) / averagedmg) * (level * level));
        $scope.bosses[$scope.bosses.length] = {
            id: $scope.bosses.length,
            name: monstersist[random].name,
            value: level,
            minDamage: randomMin,
            maxDamage: randomMax,
            health: mobHealth,
            low: "Junk;j;" + (level * 3),
            high: "Gold;g;" + level
        }
        $scope.debugLog("Created " + $scope.bosses[($scope.bosses.length - 1)].name);
        monstersist.splice(random, 1);

    }

    $scope.dungeonName = function() {
        var dList = $scope.dungeonNames.dungeons.slice();
        for (i = 0; i < $scope.dungeons.length; i++) {
            for (j = 0; j < dList.length; j++) {
                if (dList[j] == $scope.dungeons[i].name) {
                    $scope.debugLog("Removed " + dList[j]);
                    dList.splice(j, 1);

                }
            }
        }
        random = Math.floor(Math.random() * dList.length);
        name = dList[random];
        return name
    }



    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Combat/ and Adventuring --------------------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

    
    $scope.attemptDungeon = function(dungeonID, hero) {
        dungeon = $scope.dungeons[dungeonID]
        var journey = {
            hero: hero,
            dungeon: dungeon,
            steps: 0
        }
        // 1 second delay for travelling through dungeon
        $timeout(function () { $scope.travel(journey); }, $scope.gameLoop);

    }


    // function/ invoked on each "step" through a dungeon
    $scope.travel = function(journey) {

        $scope.debugLog("steps:" + journey.steps);

        // if/ steps are at the end of the dungeon fight a boss.
        if (journey.steps == journey.dungeon.steps) {
            for (i = 0; i < journey.hero.length;i++){
                journey.hero[i].progress = "Fighting Boss!";
            }            
            $scope.bossFight(journey);
        }
        else {
            // Roll/ for encounter
            var roll = Math.floor((Math.random() * 100) + 1);
            if (roll < journey.dungeon.encounterRate) {

                $scope.debugLog("Encounter Forming");

                // Form/ an encounter of $scope.monsters below "encounter level"

                $scope.monsterFight(journey);
                for (i = 0; i < journey.hero.length; i++) {
                    journey.hero[i].progress = "Fighting Encounter!";
                }

            }
            else {
                // if/ there is no fight for that step, take another step and update progress.
                journey.steps++;
                for (i = 0; i < journey.hero.length; i++) {
                    journey.hero[i].progress = Math.round((journey.steps / journey.dungeon.steps) * 100) + "%" + " Complete";
                }
                $timeout(function () { $scope.travel(journey) }, $scope.gameLoop);
            }
        }

    }

    $scope.monsterFight = function (journey) {
        var eLevel = journey.dungeon.encounterLevel;
        var validMonsters = [];
        var encounterMonsters = [];
        var monsterCount = 0;
        var currentMonster;
        var currLevel = 0;
        var copyMonsters = $scope.monsters.slice();
        $scope.debugLog("Encounter Level= " + eLevel);
        for (i = 0; i < copyMonsters.length; i++) {
            if (copyMonsters[i].value >= Math.floor(eLevel / 4) && copyMonsters[i].value <= eLevel) {
                validMonsters[validMonsters.length] = copyMonsters[i];
            }
        }
        while (monsterCount < 4 && currLevel < eLevel && (eLevel - currLevel) >= Math.floor(eLevel / 4)) {
            var reducedMonster = [];
            for (i = 0; i < validMonsters.length; i++) {
                if (validMonsters[i].value <= (eLevel - currLevel)) {
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
                low: "Junk;j;" + parseInt(reducedMonster[currentMonster].value * 3 * multi),
                high: "Gold;g;" + parseInt(reducedMonster[currentMonster].value * multi)
            }
            monsterCount++;
            currLevel += reducedMonster[currentMonster].value;
        }
        $scope.startFight(encounterMonsters, journey, false);
    }

    $scope.bossFight = function(journey) {
        bossID = journey.dungeon.bossID;
        var multi = 1;
        if (journey.hero.length > 1) {
            multi = 10;
        }       
        var bossBattle = [{
            name: $scope.bosses[bossID].name,
            value: $scope.bosses[bossID].value * multi,
            minDamage: $scope.bosses[bossID].minDamage * multi,
            maxDamage: $scope.bosses[bossID].maxDamage * multi,
            health: $scope.bosses[bossID].health * multi,
            maxHealth: $scope.bosses[bossID].health * multi,
            high: "Junk;j;" + parseInt($scope.bosses[bossID].value * multi * 3),
            low: "Gold;g;" + parseInt($scope.bosses[bossID].value * multi)
        }]
        $scope.startFight(bossBattle.slice(), journey, true);
    }

    $scope.startFight = function(monList, journey, boss) {
        var thisBattle = $scope.battles.length;
        $scope.battles[thisBattle] = {
            id: thisBattle,
            hero: journey.hero,
            copyMonsters: monList.slice(),
            experience: 0,
            boss: boss
        }
        $scope.takeTurn($scope.battles[thisBattle], journey);
    }

    $scope.takeTurn = function(battle, journey) {
        var turnDamage = 0;
        var hero = journey.hero;
        var monstersList = battle.copyMonsters

        // Start/ of hero turn
        var dead;
        dead = $scope.heroTurn(hero, monstersList);
        $scope.debugLog("Arrived after heroTurn");    

        // Start/ of monsters turn
        

        if (!$scope.monstersAlive(monstersList)) {
            // Win/ battle what happens?
            $scope.gameStats.wins++;
            for (j = 0; j < monstersList.length; j++) {
                for (i = 0; i < hero.length; i++) {
                    if (hero[i].level <= (journey.dungeon.level * 2)) {
                        battle.experience += (monstersList[j].value * 5);
                    }
                    lootChance = Math.random() * 100;
                        if (lootChance < 10) {
                            if (monstersList[j].high != null) {
                                $scope.addLoot(monstersList[j].high, hero[i]);
                            }

                        }

                }
            }
            if (battle.boss) {
                for (i = 0; i < hero.length; i++) {
                    if ((hero[i].dungeon + 1) < $scope.dungeons.length) {
                        if (hero[i].clearCount >= $scope.successCount.amount) {
                            hero[i].dungeon++;
                            hero[i].clearCount = 0;
                        }
                        else {
                            hero[i].clearCount++;
                        }

                    }
                    hero[i].location = 'Home';
                    hero[i].progress = "Resting";
                    $scope.addLoot(journey.dungeon.reward, hero[i]);
                }
            }
            else {
                for (k = 0; k < hero.length; k++) {
                    journey.steps++;
                    hero[k].progress = Math.round((journey.steps / journey.dungeon.steps) * 100) + "%" + " Complete";
                }

                $timeout(function () { $scope.travel(journey) }, $scope.gameLoop);

            }
            for (i = 0; i < hero.length; i++) {
                
                $scope.gainExp(hero[i],battle.experience);
                
            }
            $scope.debugLog("winner");
            $scope.battles.splice($scope.battles.indexOf(battle), 1);
            $scope.debugLog($scope.battles.length);
        }

        else if ($scope.enemyTurn(hero, monstersList)) {
            for (i = 0; i < hero.length; i++) {
                // Lost/ battle what happens?
                $scope.battles.splice($scope.battles.indexOf(battle), 1);
                $scope.gameStats.losses++;
                hero[i].location = 'Home';
                hero[i].currHealth = 0;
                hero[i].progress = "Resting";
                hero[i].equip.weapon = $.extend(true, {}, $scope.weapons[0]);
                hero[i].equip.potion = [];
                if ($scope.buildings[0].tier == 1) {
                    hero[i].experience = 0;
                    hero[i].equip.scrap = 0;
                    hero[i].equip.gold = 0;
                    hero[i].level = 1;
                    hero[i].next = 50;
                    hero[i].health = 100;
                    hero[i].dungeon = 0;
                    $scope.showError("A hero has lost a fight, he has also lost all his progress and must start again.");
                    
                }
                else {
                    if ((hero[i].dungeon - $scope.lossCount.amount) > 0) {
                        hero[i].dungeon -= $scope.lossCount.amount;
                    }
                    else {
                        hero[i].dungeon = 0;
                    }
                    $scope.showError("A hero lost a fight, he has respawned in town and must heal before fighting.")
                }
                $scope.debugLog("loser");
            }


        }
        else {
            $timeout(function () { $scope.takeTurn(battle, journey) }, $scope.gameLoop);
        }
    }      

    // Hero/ turn during battle
    $scope.heroTurn = function(heroL, enemyL) {
        var damage = 0;
        $scope.debugLog("Arrived in heroTurn");
        for (i = 0; i < heroL.length; i++) {
            if (heroL[i].currHealth > 0) {
                damage += $scope.heroDamage(heroL[i]);
            }
            $scope.debugLog("Doing " + damage + " damage");
        }
        var dead = 0;
        for (i = 0; i < enemyL.length; i++) {
            if (enemyL[i].health == 0) {
                dead++;
            }
        }
        var tempDead = [];
        for (i = 0; i < enemyL.length; i++) {
            if (enemyL[i].health == 0) {
            }
            else if (enemyL[i].health < (damage)) {
                enemyL[i].health = 0;
                tempDead[tempDead.length] = enemyL[i];
                damage = 0;
            }
            else {
                enemyL[i].health -= damage;
                damage = 0;
            }
        }
        return tempDead
    }

    $scope.heroDamage = function(hero) {
        if (hero.equip.weapon.id != $scope.weapons[0].id) {

            if (hero.equip.weapon.durability <= 0) {
                    hero.equip.weapon = $.extend(true, {}, $scope.weapons[0]);
                    return hero.equip.weapon.minDamage * $scope.damageMulti;
                
            }

            else {
                var min = hero.equip.weapon.minDamage;
                var max = hero.equip.weapon.maxDamage;
                var damage = (Math.floor(Math.random() * (max - min + 1))) + min;
                hero.equip.weapon.durability--;
            }
            return damage * $scope.damageMulti;
        }
        else {
            return 1 * $scope.damageMulti;
        }
    }

    $scope.monstersAlive = function (monsterList) {
        dead = 0;
        for (i = 0; i < monsterList.length; i++) {
            if (monsterList[i].health <= 0) {
                dead++
            }
        }
        return (monsterList.length != dead)
    }

    // enemy/ Turn
    $scope.enemyTurn = function (hero, monsterList) {
        var turnDamage = 0;
        for (i = 0; i < monsterList.length; i++) {
            if (monsterList[i].health > 0) {
                var mobDam = $scope.enemyDamage(monsterList[i]);
                turnDamage += mobDam;
            }
        }
        $scope.debugLog("Taking " + turnDamage + " damage");
        var dead = 0;
        for (k = 0; k < hero.length; k++) {
            
            if (hero[k].currHealth <= 0){
                dead++;
            }
        }
        for (k = 0; k < hero.length; k++) {
            if (hero[k].currHealth <= 0) {
                $scope.debugLog("Hero is already Dead");
            }
            else if (hero[k].currHealth <= turnDamage / (hero.length - dead)) {
                hero[k].currHealth = 0;
                $scope.debugLog("Hero Died");
                dead++;
            }
            else {
                heroDamage = Math.floor(turnDamage / (hero.length - dead));
                if (k < heroDamage % (hero.length - dead)) {
                    heroDamage++;
                    
                }
                $scope.debugLog("Taking " + turnDamage + " damage");
                hero[k].currHealth -= heroDamage;
            }
            
        }
        return (hero.length == dead)
    }

    $scope.enemyDamage = function(enemy) {
        if (enemy.health <= 0)
            return 0;
        else {
            var min = enemy.minDamage;
            var max = enemy.maxDamage;
            var damage = (Math.floor(Math.random() * (max - min + 1))) + min;
            return damage;
        }
        


    }



    $scope.addLoot = function(item, hero) {
        if (item != null) {
            var itemsplit = item.split(";");
            var itemName = itemsplit[0];
            var itemType = itemsplit[1];
            var itemValue = itemsplit[2];
            if (hero.academy.id == 2) {
                itemValue += Math.ceil(itemValue * .15);
            }
            $scope.debugLog(itemType);
            switch (itemType) {
                case 'j': {
                    hero.equip.scrap += parseInt(itemValue);
                    break;
                }
                case 'g': {
                    hero.equip.gold += parseInt(itemValue);
                    break;
                }
            }
        }

    }

    

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Production/ --------------------------------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.createPotion = function (button, start, heroID) {
        if (heroID != 0) {
            heroID = heroID || -1;
        }

        if ($scope.potion.prodTime > start) {
            if (button) {
                $scope.potion.progress = ($scope.potion.prodTime - start).toString().toHHMMSS();
            }
            else if (heroID >= 0) {
                $scope.heroList[heroID].progress = ($scope.potion.prodTime - start).toString().toHHMMSS();
            }
            var caller = arguments.callee;
            setTimeout(function () { caller(button, start + 1, heroID); }, $scope.gameLoop);
        }
        else {
            $scope.potion.working--;
            $scope.potion.count++;
            if (button) {
                $scope.potion.progress = "Create Potion"; 
                $('#potionButt').removeAttr('disabled');
            }
            else if (heroID >= 0) {
                $scope.heroList[heroID].progress = "Idle";
            }

        }
    }

    $scope.createPotions = function(potionID, button, start, heroID) {
        if (heroID != 0) {
            heroID = heroID || -1;
        }
        acc = $scope.potions[potionID];
        if (acc.prodTime > start) {
            if (button) {
                acc.progress = (acc.prodTime - start).toString().toHHMMSS();
            }
            else if (heroID >= 0) {
                $scope.heroList[heroID].progress = (acc.prodTime - start).toString().toHHMMSS();
            }
            var caller = arguments.callee;
            setTimeout(function () { caller(potionID, button, start + 1, heroID); }, $scope.gameLoop);
        }
        else {
            acc.count++;
            acc.working--;
            if (button) {
                acc.progress = "Create " + acc.name; 
                $('#a' + potionID).removeAttr('disabled');
            }
            else if (heroID >= 0) {
                $scope.heroList[heroID].progress = "Idle"; }
            }
        }


    

    $scope.buyWeapon = function(weaponID, button, start, heroID) {
        if (heroID != 0) {
            heroID = heroID || -1;
        }
        if ($scope.weapons[weaponID].prodTime > start) {
            if (button) {
                $scope.weapons[weaponID].progress = ($scope.weapons[weaponID].prodTime - start).toString().toHHMMSS();
            }
            else if (heroID >= 0) {
                $scope.heroList[heroID].progress = ($scope.weapons[weaponID].prodTime - start).toString().toHHMMSS();
            }
            var caller = arguments.callee;
            setTimeout(function () { caller(weaponID, button, start + 1, heroID); }, $scope.gameLoop);
        }
        else {
            $scope.weapons[weaponID].count++;
            $scope.weapons[weaponID].working--;
            if (button) {
                $scope.weapons[weaponID].progress = "Create " + $scope.weapons[weaponID].name;
                $('#w' + weaponID).removeAttr('disabled');
            }
            else if (heroID >= 0) {
                $scope.heroList[heroID].progress = "Idle";
            }
        }
    }

    $scope.buyUpgrade = function(upgradeID) {
        if ($scope.upgrades[upgradeID].price <= $scope.gold) {
            $scope.decGold($scope.upgrades[upgradeID].price);
            $scope.upgrades[upgradeID].enabled = false;
                switch (upgradeID) {
                    case 0: {
                        $scope.incr++;                        
                        if ($scope.panelNumber == 9) {
                            $scope.nextTutorial();
                        }
                        $scope.upgrades[2].enabled = true;
                        break;
                    }
                    case 1: {
                        $scope.buildings[0].tier++;
                        $scope.buildings[0].name = 'Campsite';
                        $scope.restAmount += 3;
                        
                        if ($scope.panelNumber == 18) {
                            $scope.nextTutorial();
                        }
                        break;
                    }
                    case 2: {
                        $scope.incr++;
                        $scope.upgrades[3].enabled = true;
                        break;
                    }
                    case 3: {
                        $scope.incr += 2;
                        break;
                    }
                }
            

        }
        else {
            $scope.showError("You do not have enough Gold");
        }

    }

    $scope.activateBlueprint = function(value) {
        if(!$scope.blueprints[value].enabled && !$scope.blueprints[value].cost == 0){
            $scope.blueprints[value].enabled = true;
        }
    }



    

    

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Safety/ Function ---------------------------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.incGold = function(value) {
        if ((value * $scope.goldMulti) < ($scope.maxGold - $scope.gold)) {
            $scope.gold += value * $scope.goldMulti;
        }
        else {
            $scope.gold = $scope.maxGold;
        }
    }

    $scope.decGold = function(value) {
        if ($scope.gold >= value) {
            $scope.gold -= value;
            return true;
        }
        else {
            false;
        }
    }


    $scope.incResources = function(value) {
        if (value < ($scope.maxResources - $scope.resources)) {
            $scope.resources += value;
        }
        else {
            $scope.resources = $scope.maxResources;
        }
    }

    $scope.decResources = function(value) {
        if ($scope.resources >= value) {
            $scope.resources -= value;
            return true;
        }
        else {
            false;
        }

    }

    $scope.gainExp = function (hero, amount) {
        hero.experience += amount;
        if (hero.experience >= hero.next) {
            hero.level++
            hero.next += hero.level * 25;
            hero.health += 50;
            hero.experience = 0;
            
            if (hero.level >= 3 && $scope.buildings[4].count == 0 && !($scope.buildings[4].enabled)) {
                $scope.activateBlueprint(2);
            }
            if (hero.level >= 10 && $scope.buildings[7].count == 0 && !($scope.buildings[7].enabled)) {
               // $scope.activateBlueprint(5);
            }
        }
    }

    function heal(heroID, amount, flag) {

        var hero = $scope.heroList[heroID];

        if (flag == 1) {
            amount = Math.floor((hero.health / 100) * amount);
        }

        if ((hero.currHealth + amount) < hero.health) {
            hero.currHealth += amount;
        }
        else {
            hero.currHealth = hero.health;
        }

    }

    $scope.greaterThan = function (prop, val) {
        return function (item) {
            if (item[prop] > val) return true;
        }
    }

    $scope.meetRequirements = function (hero, weapon) {
        var result = false;
        for (var i = 0; i < weapon.heroClass.length; i++) {
            if (weapon.heroClass[i] == hero.academy.id) {
                result = true;
            }
        }
        return result
    }

});
