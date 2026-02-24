/**
 * Production: potions, weapons, upgrades, blueprints.
 * Used by MainController; receives scope for state; controller provides onDone for DOM (e.g. button enable).
 */

function ProductionServiceFactory(EconomyService) {

    function createPotion(scope, button, start, heroID, onDone) {
        if (heroID !== 0) {
            heroID = heroID || -1;
        }
        if (scope.potion.prodTime > start) {
            if (button) {
                scope.potion.progress = (scope.potion.prodTime - start).toString().toHHMMSS();
            } else if (heroID >= 0) {
                scope.heroList[heroID].progress = (scope.potion.prodTime - start).toString().toHHMMSS();
            }
            setTimeout(function () {
                createPotion(scope, button, start + 1, heroID, onDone);
            }, scope.gameLoop);
        } else {
            scope.potion.working--;
            scope.potion.count++;
            if (button) {
                scope.potion.progress = "Create Potion";
                if (onDone) onDone();
            } else if (heroID >= 0) {
                scope.heroList[heroID].progress = "Idle";
            }
        }
    }

    function createPotions(scope, potionID, button, start, heroID, onDone) {
        if (heroID !== 0) {
            heroID = heroID || -1;
        }
        const acc = scope.potions[potionID];
        if (acc.prodTime > start) {
            if (button) {
                acc.progress = (acc.prodTime - start).toString().toHHMMSS();
            } else if (heroID >= 0) {
                scope.heroList[heroID].progress = (acc.prodTime - start).toString().toHHMMSS();
            }
            setTimeout(function () {
                createPotions(scope, potionID, button, start + 1, heroID, onDone);
            }, scope.gameLoop);
        } else {
            acc.count++;
            acc.working--;
            if (button) {
                acc.progress = "Create " + acc.name;
                if (onDone) onDone();
            } else if (heroID >= 0) {
                scope.heroList[heroID].progress = "Idle";
            }
        }
    }

    function buyWeapon(scope, weaponID, button, start, heroID, onDone) {
        if (heroID !== 0) {
            heroID = heroID || -1;
        }
        const weapon = scope.weapons[weaponID];
        if (weapon.prodTime > start) {
            if (button) {
                weapon.progress = (weapon.prodTime - start).toString().toHHMMSS();
            } else if (heroID >= 0) {
                scope.heroList[heroID].progress = (weapon.prodTime - start).toString().toHHMMSS();
            }
            setTimeout(function () {
                buyWeapon(scope, weaponID, button, start + 1, heroID, onDone);
            }, scope.gameLoop);
        } else {
            weapon.count++;
            weapon.working--;
            if (button) {
                weapon.progress = "Create " + weapon.name;
                if (onDone) onDone();
            } else if (heroID >= 0) {
                scope.heroList[heroID].progress = "Idle";
            }
        }
    }

    function buyUpgrade(scope, upgradeID) {
        if (scope.upgrades[upgradeID].price <= scope.gold) {
            scope.decGold(scope.upgrades[upgradeID].price);
            scope.upgrades[upgradeID].enabled = false;
            switch (upgradeID) {
                case 0: {
                    scope.incr++;
                    if (scope.panelNumber === 9) {
                        scope.nextTutorial();
                    }
                    scope.upgrades[2].enabled = true;
                    break;
                }
                case 1: {
                    scope.buildings[0].tier++;
                    scope.buildings[0].name = 'Campsite';
                    scope.restAmount += 3;
                    if (scope.panelNumber === 18) {
                        scope.nextTutorial();
                    }
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
                    scope.incr = scope.incr * 2;
                    scope.upgrades[upgradeID + 1].enabled = true;
                    break;
                }
                case 10: {
                    scope.incr = scope.incr * 2;
                    break;
                }
            }
        } else {
            scope.showError("You do not have enough Gold");
        }
    }

    function activateBlueprint(scope, value) {
        if (!scope.blueprints[value].enabled && !scope.blueprints[value].cost == 0) {
            scope.blueprints[value].enabled = true;
        }
    }

    function create(scope, itemID) {
        if (itemID === -1) {
            if (scope.potion.count + scope.potion.working >= scope.potion.maxCount) return;
            if (!EconomyService.decResources(scope.potion.cost)) {
                scope.showError("You do not have enough Resources.");
                return;
            }
            if (scope.panelNumber === 7) scope.nextTutorial();
            if (scope.disablePotionButton) scope.disablePotionButton(-1);
            scope.potion.working++;
            scope.createPotion(true, 0);
        } else {
            if (scope.potions[itemID].count + scope.potions[itemID].working >= scope.potions[itemID].maxCount) return;
            if (!EconomyService.decResources(scope.potions[itemID].cost)) {
                scope.showError("You do not have enough Resources.");
                return;
            }
            if (scope.disablePotionButton) scope.disablePotionButton(itemID);
            scope.potions[itemID].working++;
            scope.createPotions(itemID, true, 0);
        }
    }

    function purchaseWeapon(scope, weaponID) {
        const w = scope.weapons[weaponID];
        if (w.count + w.working >= w.maxCount) return;
        if (scope.resources < w.cost) {
            scope.showError("You do not have enough Resources.");
            return;
        }
        if (scope.disableWeaponButton) scope.disableWeaponButton(weaponID);
        EconomyService.decResources(w.cost);
        w.working++;
        if (scope.panelNumber === 16) scope.nextTutorial();
        if (scope.buildings[0].tier === 1) scope.upgrades[1].enabled = true;
        if (!(scope.gameStats.weaponsManual[weaponID] >= 0)) scope.gameStats.weaponsManual[weaponID] = 0;
        scope.gameStats.weaponsManual[weaponID]++;
        scope.buyWeapon(weaponID, true, 0);
    }

    return {
        createPotion,
        createPotions,
        buyWeapon,
        buyUpgrade,
        activateBlueprint,
        create,
        purchaseWeapon
    };
}

export default ProductionServiceFactory;
