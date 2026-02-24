/**
 * Combat/battle resolution: turns, damage, loot, potions.
 * Used by MainController; receives scope (and $timeout) for callbacks and state.
 */

function CombatServiceFactory($timeout, GameConfig) {
    const HERO_CLASSES = GameConfig.heroClasses || [];

    function activatePotions(hero) {
        for (let i = 0; i < hero.length; i++) {
            if (hero[i].equip.potions[0].count > 0) {
                hero[i].equip.potions[0].active = true;
            }
            if (hero[i].equip.potions[1].count > 0) {
                hero[i].equip.potions[1].active = true;
            }
        }
    }

    function clearPotions(hero) {
        for (let i = 1; i < hero.equip.potions.length; i++) {
            if (hero.equip.potions[i].active) {
                hero.equip.potions[i].amount--;
            }
        }
    }

    function heroDamage(scope, hero) {
        if (hero.equip.weapon.id !== scope.weapons[0].id) {
            if (hero.equip.weapon.broken === false) {
                if (hero.equip.weapon.durability <= 0) {
                    hero.equip.weapon.minDamage = Math.ceil(hero.equip.weapon.minDamage / 2);
                    hero.equip.weapon.maxDamage = Math.ceil(hero.equip.weapon.maxDamage / 2);
                    hero.equip.weapon.broken = true;
                } else {
                    hero.equip.weapon.durability--;
                }
            }
            const min = hero.equip.weapon.minDamage;
            const max = hero.equip.weapon.maxDamage;
            const damage = Math.floor(Math.random() * (max - min + 1)) + min;
            let heroDamageMulti = 1;
            if (hero.equip.potions[1].active === true) {
                heroDamageMulti = 1.5;
            }
            return Math.ceil(damage * scope.damageMulti * heroDamageMulti);
        }
        return 1 * scope.damageMulti;
    }

    function monstersAlive(monsterList) {
        let dead = 0;
        for (let i = 0; i < monsterList.length; i++) {
            if (monsterList[i].health <= 0) dead++;
        }
        return monsterList.length !== dead;
    }

    function enemyDamage(enemy) {
        if (enemy.health <= 0) return 0;
        const min = enemy.minDamage;
        const max = enemy.maxDamage;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function heroTurn(scope, heroL, enemyL) {
        let damage = 0;
        if (typeof scope.debugLog === 'function') scope.debugLog('Arrived in heroTurn');
        for (let i = 0; i < heroL.length; i++) {
            if (heroL[i].currHealth > 0) {
                if (heroL[i].equip.potions[0].active && typeof scope.heal === 'function') {
                    scope.heal(i, scope.potions[0].value, 1);
                }
                damage += heroDamage(scope, heroL[i]);
            }
        }
        if (typeof scope.debugLog === 'function') scope.debugLog('Doing ' + damage + ' damage');
        const tempDead = [];
        for (let i = 0; i < enemyL.length; i++) {
            if (enemyL[i].health === 0) {
                // already dead
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
    }

    function enemyTurn(scope, hero, monsterList) {
        let turnDamage = 0;
        for (let i = 0; i < monsterList.length; i++) {
            if (monsterList[i].health > 0) {
                turnDamage += enemyDamage(monsterList[i]);
            }
        }
        if (typeof scope.debugLog === 'function') scope.debugLog('Taking ' + turnDamage + ' damage');
        let dead = 0;
        for (let k = 0; k < hero.length; k++) {
            if (hero[k].currHealth <= 0) dead++;
        }
        for (let k = 0; k < hero.length; k++) {
            if (hero[k].currHealth <= 0) {
                if (typeof scope.debugLog === 'function') scope.debugLog('Hero is already Dead');
            } else if (hero[k].currHealth <= turnDamage / (hero.length - dead)) {
                hero[k].currHealth = 0;
                if (typeof scope.debugLog === 'function') scope.debugLog('Hero Died');
                dead++;
            } else {
                let heroDamageAmount = Math.floor(turnDamage / (hero.length - dead));
                if (k < heroDamageAmount % (hero.length - dead)) {
                    heroDamageAmount++;
                }
                if (typeof scope.debugLog === 'function') scope.debugLog('Taking ' + turnDamage + ' damage');
                hero[k].currHealth -= heroDamageAmount;
                if (hero[k].equip.potions[4] && hero[k].equip.potions[4].count > 0 && hero[k].health - hero[k].currHealth > scope.potions[4].value && typeof scope.heal === 'function') {
                    hero[k].equip.potions[4].count--;
                    scope.heal(k, scope.potions[4].value);
                } else if (hero[k].equip.potions[3] && hero[k].equip.potions[3].count > 0 && hero[k].health - hero[k].currHealth > scope.potions[3].value && typeof scope.heal === 'function') {
                    hero[k].equip.potions[3].count--;
                    scope.heal(k, scope.potions[3].value);
                } else if (hero[k].equip.potions[2] && hero[k].equip.potions[2].count > 0 && hero[k].health - hero[k].currHealth > scope.potions[2].value && typeof scope.heal === 'function') {
                    hero[k].equip.potions[2].count--;
                    scope.heal(k, scope.potions[2].value);
                }
            }
        }
        return hero.length === dead;
    }

    function addLoot(scope, item, hero) {
        if (item == null) return;
        const itemsplit = item.split(';');
        const itemType = itemsplit[1];
        let itemValue = itemsplit[2];
        if (HERO_CLASSES[2] && hero.academy && hero.academy.id === HERO_CLASSES[2].id) {
            itemValue += Math.ceil(itemValue * 0.15);
        }
        if (typeof scope.debugLog === 'function') scope.debugLog(itemType);
        switch (itemType) {
            case 'j':
                hero.equip.scrap += parseInt(itemValue, 10);
                break;
            case 'g':
                hero.equip.gold += parseInt(itemValue, 10);
                break;
        }
    }

    function takeTurn(scope, battle, journey) {
        const hero = journey.hero;
        const monstersList = battle.copyMonsters;

        heroTurn(scope, hero, monstersList);
        if (typeof scope.debugLog === 'function') scope.debugLog('Arrived after heroTurn');

        if (!monstersAlive(monstersList)) {
            scope.gameStats.wins++;
            for (let i = 1; i < hero.length; i++) {
                clearPotions(hero[i]);
            }
            for (let j = 0; j < monstersList.length; j++) {
                for (let i = 0; i < hero.length; i++) {
                    if (hero[i].level <= journey.dungeon.level * 2) {
                        battle.experience += monstersList[j].value * 5;
                    }
                    const lootChance = Math.random() * 100;
                    if (lootChance < 10 && monstersList[j].high != null) {
                        addLoot(scope, monstersList[j].high, hero[i]);
                    }
                }
            }
            if (battle.boss) {
                for (let i = 0; i < hero.length; i++) {
                    if (hero[i].dungeon + 1 < scope.dungeons.length) {
                        if (hero[i].clearCount >= scope.successCount.amount) {
                            hero[i].dungeon++;
                            hero[i].clearCount = 0;
                        } else {
                            hero[i].clearCount++;
                        }
                    }
                    hero[i].location = 'Home';
                    hero[i].progress = 'Resting';
                    addLoot(scope, journey.dungeon.reward, hero[i]);
                }
            } else {
                for (let k = 0; k < hero.length; k++) {
                    journey.steps++;
                    hero[k].progress = Math.round((journey.steps / journey.dungeon.steps) * 100) + '%' + ' Complete';
                }
                $timeout(function () {
                    scope.travel(journey);
                }, scope.gameLoop);
            }
            for (let i = 0; i < hero.length; i++) {
                scope.gainExp(hero[i], battle.experience);
            }
            if (typeof scope.debugLog === 'function') scope.debugLog('winner');
            scope.battles.splice(scope.battles.indexOf(battle), 1);
        } else if (enemyTurn(scope, hero, monstersList)) {
            scope.battles.splice(scope.battles.indexOf(battle), 1);
            scope.gameStats.losses++;
            for (let i = 0; i < hero.length; i++) {
                hero[i].location = 'Home';
                hero[i].currHealth = 0;
                hero[i].progress = 'Resting';
                hero[i].equip.weapon = JSON.parse(JSON.stringify(scope.weapons[0]));
                clearPotions(hero[i]);
                if (scope.buildings[0].tier === 1) {
                    hero[i].experience = 0;
                    hero[i].equip.scrap = 0;
                    hero[i].equip.gold = 0;
                    hero[i].level = 1;
                    hero[i].next = 50;
                    hero[i].health = 100;
                    hero[i].dungeon = 0;
                    if (typeof scope.showError === 'function') scope.showError('A hero has lost a fight, he has also lost all his progress and must start again.');
                } else {
                    hero[i].dungeon = (hero[i].dungeon - scope.lossCount.amount) > 0 ? hero[i].dungeon - scope.lossCount.amount : 0;
                    if (typeof scope.showError === 'function') scope.showError('A hero lost a fight, he has respawned in town and must heal before fighting.');
                }
                if (typeof scope.debugLog === 'function') scope.debugLog('loser');
            }
        } else {
            $timeout(function () {
                takeTurn(scope, battle, journey);
            }, scope.gameLoop);
        }
    }

    function startFight(scope, monList, journey, boss) {
        const thisBattle = scope.battles.length;
        scope.battles[thisBattle] = {
            id: thisBattle,
            hero: journey.hero,
            copyMonsters: monList.slice(),
            experience: 0,
            boss: boss
        };
        activatePotions(journey.hero);
        takeTurn(scope, scope.battles[thisBattle], journey);
    }

    return {
        startFight,
        activatePotions,
        takeTurn,
        clearPotions,
        heroTurn,
        heroDamage,
        monstersAlive,
        enemyTurn,
        enemyDamage,
        addLoot
    };
}

export default CombatServiceFactory;
