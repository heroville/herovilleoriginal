import app from '../app.js';

app.controller("MainController", function ($scope, $interval, $timeout, $http, GameConfig, GameStateService, EconomyService, SaveLoadService, CombatService, DungeonService, HeroService, ProductionService, UiService, UtilService, BuildingService, GameUiService) {
    $scope.dark = false;
    $scope.forceReset = true;

    const state = GameStateService.getState();
    $scope.state = state;
    EconomyService.bindState(state);

    GameUiService.register($scope);

    // Bridge for React shell (Phase 2 setup): state, UI callbacks, and tab actions for migration
    window.__HEROVILLE_BRIDGE__ = {
        getState: function () { return GameStateService.getState(); },
        gameUi: GameUiService,
        town: {
            incrBuilding: function (building) {
                const { state, actions } = BuildingService.buildStateAndActions({
                    decResources: function (v) { return EconomyService.decResources(v); },
                    decGold: function (v) { return EconomyService.decGold(v); }
                });
                BuildingService.incrBuilding(state, actions, building);
            }
        }
    };

    $scope.incGold = EconomyService.incGold;
    $scope.decGold = EconomyService.decGold;
    $scope.incResources = EconomyService.incResources;
    $scope.decResources = EconomyService.decResources;

    $http.get('models/heroName.json')
        .then(function (response) {
            state.heroName = response.data;
        });

    $http.get('models/monsterList.json')
        .then(function (response) {
            state.monsterList = response.data;
        });

    $http.get('models/dungeons.json')
        .then(function (response) {
            state.dungeonNames = response.data;
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
            $("#showOld").prop("checked", $scope.state.heroTable);
        }
    };

    $scope.load = function () {
        const result = SaveLoadService.load($scope);
        if (result === 'version_mismatch') {
            $("#loading").dialog("open");
        } else if (result === 'loaded' && typeof $ !== 'undefined') {
            $("#showOld").prop("checked", $scope.state.heroTable);
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

    $scope.heroClassChange = function (selectedClassID, heroID) {
        HeroService.heroClassChange(selectedClassID, heroID);
        $("#confirm").dialog("open");
    };
    $scope.confirmClass = HeroService.confirmClass;

    $scope.randomEvent = function (type) {
        const s = $scope.state;
        s.randomEventTimer = 600000 + Math.floor(Math.random() * 600000);
        $scope.showError("You got " + type);
        switch (type) {
            case "Power": {
                s.damageMulti = 2;
                $timeout(function () { s.damageMulti = 1; }, 300000);
                break;
            }
            case "Wealth": {
                s.goldMulti = 2;
                $timeout(function () { s.goldMulti = 1; }, 300000);
                break;
            }
            case "Speed": {
                s.gameLoop = 500;
                $timeout(function () { s.gameLoop = 1000; }, 60000);
                break;
            }
        }
        $timeout(function () {
            s.randomE = s.events[Math.floor(Math.random() * s.events.length)];
        }, s.randomEventTimer);
    };

    $scope.nextTutorial = function () {
        UiService.nextTutorial($scope);
    };

    // Tutorial progress is now driven by GameUiService.checkTutorialProgress() from EconomyService when resources/gold change.

    $interval(function () { $scope.work(); $scope.rest(); }, $scope.state.gameLoop);

    $interval(function () { $scope.save(); }, 30000);

    $timeout(function () {
        const s = $scope.state;
        s.randomE = s.events[Math.floor(Math.random() * s.events.length)];
    }, $scope.state.randomEventTimer);

    $scope.randomSliderPos = { top: Math.random() * 100 + "%", left: Math.random() * 100 + "%" };
    $interval(function () {
        $scope.randomSliderPos = { top: Math.random() * 100 + "%", left: Math.random() * 100 + "%" };
    }, 2000);

    $scope.rest = HeroService.rest;
    $scope.work = HeroService.work;

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Technical/ and Initialization --------------------------------------------------------------------------------------------------------------------------------//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    

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
                    for (let i = 0; i < $scope.state.heroList.length; i++) {
                        if ($scope.state.heroList[i].name == hName) {
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
                    for (let i = 0; i < $scope.state.heroList.length; i++) {
                        if ($scope.state.heroList[i].name == wName) {
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
                        $("#showOld").prop("checked", $scope.state.heroTable);
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

    $scope.addHero = HeroService.addHero;
    $scope.addWorker = HeroService.addWorker;
    $scope.newHeroName = HeroService.newHeroName;

    $scope.changeTheme = function () {
        UiService.changeTheme($scope);
    };                          


    

    $scope.createPotion = function (button, start, heroID, onDone) {
        ProductionService.createPotion(button, start, heroID, onDone || function () { $('#potionButt').removeAttr('disabled'); });
    };
    $scope.createPotions = function (potionID, button, start, heroID, onDone) {
        ProductionService.createPotions(potionID, button, start, heroID, onDone || function () { $('#a' + potionID).removeAttr('disabled'); });
    };
    $scope.buyWeapon = function (weaponID, button, start, heroID, onDone) {
        ProductionService.buyWeapon(weaponID, button, start, heroID, onDone || function () { $('#w' + weaponID).removeAttr('disabled'); });
    };
    $scope.buyUpgrade = ProductionService.buyUpgrade;

    $scope.greaterThan = UtilService.greaterThan;
    $scope.meetRequirements = UtilService.meetRequirements;

    // Mount React shell after first digest (Phase 2 setup)
    $timeout(function () {
        import('../bootstrapReact.js').then(function (m) { m.default(); });
    }, 100);
});
