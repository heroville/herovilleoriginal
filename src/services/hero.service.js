/**
 * Hero and worker creation, profession/class changes, XP, healing, name generation.
 * Used by MainController; receives scope for state and callbacks.
 */

const DEFAULT_POTIONS = [
    { id: 0, name: 'Regeneration', count: 0, active: false },
    { id: 1, name: 'Power', count: 0, active: false },
    { id: 2, name: 'Health', count: 0, active: false },
    { id: 3, name: 'Good Health', count: 0, active: false },
    { id: 4, name: 'Great Health', count: 0, active: false }
];

function HeroServiceFactory(GameConfig, EconomyService) {
    const HERO_CLASSES = GameConfig.heroClasses || [];

    function defaultEquip(scope) {
        return {
            weapon: JSON.parse(JSON.stringify(scope.weapons[0])),
            potions: JSON.parse(JSON.stringify(DEFAULT_POTIONS)),
            gold: 0,
            scrap: 0
        };
    }

    function addHero(scope, heroName) {
        const hero = scope.heroList;
        hero[hero.length] = {
            id: hero.length,
            name: heroName,
            currHealth: 100,
            health: 100,
            level: 1,
            experience: 0,
            next: 50,
            equip: defaultEquip(scope),
            location: 'Home',
            progress: 'Idle',
            dungeon: 0,
            clearCount: 0,
            working: false,
            job: scope.jobs[0],
            academy: scope.heroClass[2],
            party: false
        };
    }

    function addWorker(scope, heroName) {
        const hero = scope.heroList;
        hero[hero.length] = {
            id: hero.length,
            name: heroName,
            currHealth: 100,
            health: 100,
            level: 1,
            experience: 0,
            next: 50,
            equip: defaultEquip(scope),
            location: 'Home',
            progress: 'Idle',
            dungeon: 0,
            clearCount: 0,
            working: false,
            job: scope.jobs[0],
            academy: scope.heroClass[1],
            party: false
        };
    }

    function newHeroName(scope) {
        if (!scope.heroName || !scope.heroName.first || !scope.heroName.title) {
            return 'Hero ' + scope.heroList.length;
        }
        let randFirst = Math.floor(Math.random() * scope.heroName.first.length);
        let newName = scope.heroName.first[randFirst] + ' ';
        let randTitle = Math.floor(Math.random() * scope.heroName.title.length);
        newName += scope.heroName.title[randTitle];
        if (typeof scope.debugLog === 'function') scope.debugLog(newName);
        const exist = scope.heroList.some((h) => h.name === newName);
        if (exist) return newHeroName(scope);
        return newName;
    }

    function heroProfession(scope, selectedJobID, heroID) {
        const count = scope.heroList.filter((h) => h.job.id === selectedJobID).length;
        if (count >= (scope.jobs[selectedJobID] && scope.jobs[selectedJobID].limit)) {
            if (typeof scope.showError === 'function') {
                scope.showError("You can not have another hero doing " + scope.jobs[selectedJobID].name + ".");
            }
            return;
        }
        scope.jobs[selectedJobID].current++;
        scope.heroList[heroID].progress = 'Idle';
        scope.heroList[heroID].job = scope.jobs[selectedJobID];
    }

    function heroClassChange(scope, selectedClassID, heroID) {
        scope.tempClass = scope.heroClass[selectedClassID];
        scope.tempHero = heroID;
    }

    function confirmClass(scope) {
        const hero = scope.heroList[scope.tempHero];
        const cls = scope.tempClass;
        if (!hero || !cls) return;
        hero.academy = cls;
        if (HERO_CLASSES[1] && cls.id === HERO_CLASSES[1].id) {
            hero.progress = 'Idle';
        }
        scope.tempClass = null;
        scope.tempHero = null;
    }

    function gainExp(scope, hero, amount) {
        hero.experience += amount;
        if (hero.experience >= hero.next) {
            hero.level++;
            hero.next += hero.level * 25;
            hero.health += 50;
            hero.experience = 0;
            if (scope.buildings[4] && hero.level >= 3 && scope.buildings[4].count === 0 && !scope.buildings[4].enabled) {
                if (typeof scope.activateBlueprint === 'function') scope.activateBlueprint(2);
            }
            if (scope.buildings[7] && hero.level >= 10 && scope.buildings[7].count === 0 && !scope.buildings[7].enabled) {
                // scope.activateBlueprint(5);
            }
        }
    }

    function heal(scope, heroID, amount, flag) {
        const hero = scope.heroList[heroID];
        if (!hero) return;
        if (flag === 1) {
            amount = Math.floor((hero.health / 100) * amount);
        }
        if (hero.currHealth + amount < hero.health) {
            hero.currHealth += amount;
        } else {
            hero.currHealth = hero.health;
        }
    }

    function rest(scope) {
        for (let i = 0; i < scope.heroList.length; i++) {
            const hero = scope.heroList[i];
            const weapon = hero.equip.weapon;
            if (hero.location !== 'Home') continue;
            if (hero.equip.gold > 0) {
                if (scope.buildings[3].count > hero.equip.weapon.id) {
                    for (let j = scope.buildings[3].count; j > hero.equip.weapon.id; j--) {
                        if (scope.meetRequirements(hero, scope.weapons[j])) {
                            if (hero.equip.gold >= scope.weapons[j].sellPrice && scope.weapons[j].count > 0) {
                                hero.equip.gold -= scope.weapons[j].sellPrice;
                                scope.weapons[j].count--;
                                scope.incGold(scope.weapons[j].sellPrice);
                                hero.equip.weapon = JSON.parse(JSON.stringify(scope.weapons[j]));
                                j = 0;
                            }
                        }
                    }
                }
                if ((weapon.durability <= (scope.weapons[weapon.id].durability * 0.2) || weapon.minDamage < scope.weapons[weapon.id].minDamage) && hero.equip.gold >= weapon.sellPrice && scope.weapons[weapon.id].count > 0) {
                    hero.equip.gold -= scope.weapons[weapon.id].sellPrice;
                    scope.weapons[weapon.id].count--;
                    hero.equip.weapon = JSON.parse(JSON.stringify(scope.weapons[weapon.id]));
                }
                for (let k = 0; k < hero.equip.potions.length; k++) {
                    if (scope.potions[k] && hero.equip.potions[k].count < scope.potions[k].maxHero && hero.equip.gold >= scope.potions[k].sellPrice && scope.potions[k].count > 0) {
                        hero.equip.gold -= scope.potions[k].sellPrice;
                        scope.incGold(scope.potions[k].sellPrice);
                        scope.potions[k].count--;
                        hero.equip.potions[k].count++;
                    }
                }
                if ((hero.health - hero.currHealth) >= scope.potion.healing && scope.potion.count > 0 && (scope.gold + scope.potion.sellPrice) <= scope.maxGold && hero.equip.gold >= scope.potion.sellPrice) {
                    hero.equip.gold -= scope.potion.sellPrice;
                    scope.incGold(scope.potion.sellPrice);
                    scope.potion.count--;
                    scope.heal(i, scope.potion.healing, 1);
                }
            }
            scope.heal(i, 2, 1);
            if (hero.currHealth === hero.health && (hero.academy.id === HERO_CLASSES[0].id || hero.academy.id === HERO_CLASSES[2].id)) {
                scope.attemptDungeon(hero.dungeon, [hero]);
                hero.location = scope.dungeons[hero.dungeon].name;
            } else if (hero.progress === 'Idle') {
                scope.incrRes(Math.ceil(scope.heroList[i].level / 4) ^ 2);
            }
        }
    }

    function work(scope) {
        for (let i = 0; i < scope.heroList.length; i++) {
            const hero = scope.heroList[i];
            switch (hero.job.id) {
                case 0:
                    break;
                case 1: {
                    if ((scope.potion.count + scope.potion.working) < scope.potion.maxCount && hero.progress === 'Idle') {
                        if (EconomyService.decResources(scope.potion.cost)) {
                            scope.potion.working++;
                            if (hero.academy.id !== HERO_CLASSES[1].id) {
                                scope.createPotion(false, Math.floor((hero.level * 0.05) * scope.potion.prodTime), i);
                            } else {
                                scope.gainExp(hero, Math.ceil(scope.potion.prodTime / 2));
                                scope.createPotion(false, Math.floor((hero.level * 0.05) * scope.potion.prodTime), i);
                            }
                        }
                    }
                    for (let j = 0; j < scope.potions.length; j++) {
                        if (scope.potions[j].enabled && (scope.potions[j].count + scope.potions[j].working) < scope.potions[j].maxCount && hero.progress === 'Idle') {
                            if (EconomyService.decResources(scope.potions[j].cost)) {
                                scope.potions[j].working++;
                                if (hero.academy.id !== HERO_CLASSES[1].id) {
                                    scope.createPotions(j, false, Math.floor((hero.level * 0.05) * scope.potions[j].prodTime), i);
                                } else {
                                    scope.gainExp(hero, Math.ceil(scope.potions[j].prodTime / 2));
                                    scope.createPotions(j, false, Math.floor((hero.level * 0.05) * scope.potions[j].prodTime), i);
                                }
                            }
                        }
                    }
                    break;
                }
                case 2: {
                    for (let j = 0; j < scope.weapons.length; j++) {
                        if (scope.weapons[j].enabled && (scope.weapons[j].count + scope.weapons[j].working) < scope.weapons[j].maxCount && hero.progress === 'Idle') {
                            if (EconomyService.decResources(scope.weapons[j].cost)) {
                                scope.weapons[j].working++;
                                if (hero.academy.id !== HERO_CLASSES[1].id) {
                                    scope.gameStats.weaponsAuto++;
                                    scope.buyWeapon(j, false, Math.floor((hero.level * 0.05) * scope.weapons[j].prodTime), i);
                                } else {
                                    scope.gainExp(hero, Math.ceil(scope.weapons[j].prodTime / 2));
                                    scope.gameStats.weaponsAuto++;
                                    scope.buyWeapon(j, false, Math.floor((hero.level * 0.05) * scope.weapons[j].prodTime), i);
                                }
                            }
                        }
                    }
                    break;
                }
                case 3:
                    break;
            }
        }
    }

    return {
        addHero,
        addWorker,
        newHeroName,
        heroProfession,
        heroClassChange,
        confirmClass,
        gainExp,
        heal,
        rest,
        work
    };
}

export default HeroServiceFactory;
