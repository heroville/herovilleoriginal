/**
 * Hero and worker creation, profession/class changes, XP, healing, name generation.
 * Uses GameStateService, GameUiService, DungeonService, ProductionService, UtilService, EconomyService (no scope param).
 * When store is bound via bindStore(store), dispatches REPLACE_STATE after mutations so the Redux store stays in sync.
 */
import { REPLACE_STATE } from '../store/sliceState.js';

const DEFAULT_POTIONS = [
    { id: 0, name: 'Regeneration', count: 0, active: false },
    { id: 1, name: 'Power', count: 0, active: false },
    { id: 2, name: 'Health', count: 0, active: false },
    { id: 3, name: 'Good Health', count: 0, active: false },
    { id: 4, name: 'Great Health', count: 0, active: false }
];

function HeroServiceFactory(GameConfig, EconomyService, GameStateService, GameUiService, DungeonService, ProductionService, UtilService) {
    const HERO_CLASSES = GameConfig.heroClasses || [];
    let _dispatch = null;

    function bindStore(store) {
        if (store) _dispatch = store.dispatch;
    }

    function syncStoreIfBound() {
        if (_dispatch) {
            const flat = GameStateService.getState();
            _dispatch({ type: REPLACE_STATE, payload: JSON.parse(JSON.stringify(flat)) });
        }
    }

    function defaultEquip() {
        const s = GameStateService.getState();
        return {
            weapon: JSON.parse(JSON.stringify(s.weapons[0])),
            potions: JSON.parse(JSON.stringify(DEFAULT_POTIONS)),
            gold: 0,
            scrap: 0
        };
    }

    function addHero(heroName) {
        const s = GameStateService.getState();
        const hero = s.heroList;
        hero[hero.length] = {
            id: hero.length,
            name: heroName,
            currHealth: 100,
            health: 100,
            level: 1,
            experience: 0,
            next: 50,
            equip: defaultEquip(),
            location: 'Home',
            progress: 'Idle',
            dungeon: 0,
            clearCount: 0,
            working: false,
            job: s.jobs[0],
            academy: s.heroClass[2],
            party: false
        };
        syncStoreIfBound();
    }

    function addWorker(heroName) {
        const s = GameStateService.getState();
        const hero = s.heroList;
        hero[hero.length] = {
            id: hero.length,
            name: heroName,
            currHealth: 100,
            health: 100,
            level: 1,
            experience: 0,
            next: 50,
            equip: defaultEquip(),
            location: 'Home',
            progress: 'Idle',
            dungeon: 0,
            clearCount: 0,
            working: false,
            job: s.jobs[0],
            academy: s.heroClass[1],
            party: false
        };
        syncStoreIfBound();
    }

    function newHeroName() {
        const s = GameStateService.getState();
        if (!s.heroName || !s.heroName.first || !s.heroName.title) {
            return 'Hero ' + s.heroList.length;
        }
        let randFirst = Math.floor(Math.random() * s.heroName.first.length);
        let newName = s.heroName.first[randFirst] + ' ';
        let randTitle = Math.floor(Math.random() * s.heroName.title.length);
        newName += s.heroName.title[randTitle];
        const exist = s.heroList.some((h) => h.name === newName);
        if (exist) return newHeroName();
        return newName;
    }

    function heroProfession(selectedJobID, heroID) {
        const s = GameStateService.getState();
        const count = s.heroList.filter((h) => h.job.id === selectedJobID).length;
        if (count >= (s.jobs[selectedJobID] && s.jobs[selectedJobID].limit)) {
            GameUiService.showError("You can not have another hero doing " + s.jobs[selectedJobID].name + ".");
            return;
        }
        s.jobs[selectedJobID].current++;
        s.heroList[heroID].progress = 'Idle';
        s.heroList[heroID].job = s.jobs[selectedJobID];
        syncStoreIfBound();
    }

    function heroClassChange(selectedClassID, heroID) {
        const s = GameStateService.getState();
        s.tempClass = s.heroClass[selectedClassID];
        s.tempHero = heroID;
        syncStoreIfBound();
    }

    function confirmClass() {
        const s = GameStateService.getState();
        const hero = s.heroList[s.tempHero];
        const cls = s.tempClass;
        if (!hero || !cls) return;
        hero.academy = cls;
        if (HERO_CLASSES[1] && cls.id === HERO_CLASSES[1].id) {
            hero.progress = 'Idle';
        }
        s.tempClass = null;
        s.tempHero = null;
        syncStoreIfBound();
    }

    function gainExp(hero, amount) {
        const s = GameStateService.getState();
        hero.experience += amount;
        if (hero.experience >= hero.next) {
            hero.level++;
            hero.next += hero.level * 25;
            hero.health += 50;
            hero.experience = 0;
            if (s.buildings[4] && hero.level >= 3 && s.buildings[4].count === 0 && !s.buildings[4].enabled) {
                ProductionService.activateBlueprint(2);
            }
            if (s.buildings[7] && hero.level >= 10 && s.buildings[7].count === 0 && !s.buildings[7].enabled) {
                // ProductionService.activateBlueprint(5);
            }
        }
    }

    function heal(heroID, amount, flag) {
        const s = GameStateService.getState();
        const hero = s.heroList[heroID];
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

    function rest() {
        const s = GameStateService.getState();
        for (let i = 0; i < s.heroList.length; i++) {
            const hero = s.heroList[i];
            const weapon = hero.equip.weapon;
            if (hero.location !== 'Home') continue;
            if (hero.equip.gold > 0) {
                if (s.buildings[3].count > hero.equip.weapon.id) {
                    for (let j = s.buildings[3].count; j > hero.equip.weapon.id; j--) {
                        if (UtilService.meetRequirements(hero, s.weapons[j])) {
                            if (hero.equip.gold >= s.weapons[j].sellPrice && s.weapons[j].count > 0) {
                                hero.equip.gold -= s.weapons[j].sellPrice;
                                s.weapons[j].count--;
                                EconomyService.incGold(s.weapons[j].sellPrice);
                                hero.equip.weapon = JSON.parse(JSON.stringify(s.weapons[j]));
                                j = 0;
                            }
                        }
                    }
                }
                if ((weapon.durability <= (s.weapons[weapon.id].durability * 0.2) || weapon.minDamage < s.weapons[weapon.id].minDamage) && hero.equip.gold >= weapon.sellPrice && s.weapons[weapon.id].count > 0) {
                    hero.equip.gold -= s.weapons[weapon.id].sellPrice;
                    s.weapons[weapon.id].count--;
                    hero.equip.weapon = JSON.parse(JSON.stringify(s.weapons[weapon.id]));
                }
                for (let k = 0; k < hero.equip.potions.length; k++) {
                    if (s.potions[k] && hero.equip.potions[k].count < s.potions[k].maxHero && hero.equip.gold >= s.potions[k].sellPrice && s.potions[k].count > 0) {
                        hero.equip.gold -= s.potions[k].sellPrice;
                        EconomyService.incGold(s.potions[k].sellPrice);
                        s.potions[k].count--;
                        hero.equip.potions[k].count++;
                    }
                }
                if ((hero.health - hero.currHealth) >= s.potion.healing && s.potion.count > 0 && (s.gold + s.potion.sellPrice) <= s.maxGold && hero.equip.gold >= s.potion.sellPrice) {
                    hero.equip.gold -= s.potion.sellPrice;
                    EconomyService.incGold(s.potion.sellPrice);
                    s.potion.count--;
                    heal(i, s.potion.healing, 1);
                }
            }
            heal(i, 2, 1);
            if (hero.currHealth === hero.health && (hero.academy.id === HERO_CLASSES[0].id || hero.academy.id === HERO_CLASSES[2].id)) {
                DungeonService.attemptDungeon(hero.dungeon, [hero]);
                hero.location = s.dungeons[hero.dungeon].name;
            } else if (hero.progress === 'Idle') {
                EconomyService.incrRes(Math.ceil(s.heroList[i].level / 4) ^ 2);
            }
        }
        syncStoreIfBound();
    }

    function work() {
        const s = GameStateService.getState();
        for (let i = 0; i < s.heroList.length; i++) {
            const hero = s.heroList[i];
            switch (hero.job.id) {
                case 0:
                    break;
                case 1: {
                    if ((s.potion.count + s.potion.working) < s.potion.maxCount && hero.progress === 'Idle') {
                        if (EconomyService.decResources(s.potion.cost)) {
                            s.potion.working++;
                            if (hero.academy.id !== HERO_CLASSES[1].id) {
                                ProductionService.createPotion(false, Math.floor((hero.level * 0.05) * s.potion.prodTime), i);
                            } else {
                                gainExp(hero, Math.ceil(s.potion.prodTime / 2));
                                ProductionService.createPotion(false, Math.floor((hero.level * 0.05) * s.potion.prodTime), i);
                            }
                        }
                    }
                    for (let j = 0; j < s.potions.length; j++) {
                        if (s.potions[j].enabled && (s.potions[j].count + s.potions[j].working) < s.potions[j].maxCount && hero.progress === 'Idle') {
                            if (EconomyService.decResources(s.potions[j].cost)) {
                                s.potions[j].working++;
                                if (hero.academy.id !== HERO_CLASSES[1].id) {
                                    ProductionService.createPotions(j, false, Math.floor((hero.level * 0.05) * s.potions[j].prodTime), i);
                                } else {
                                    gainExp(hero, Math.ceil(s.potions[j].prodTime / 2));
                                    ProductionService.createPotions(j, false, Math.floor((hero.level * 0.05) * s.potions[j].prodTime), i);
                                }
                            }
                        }
                    }
                    break;
                }
                case 2: {
                    for (let j = 0; j < s.weapons.length; j++) {
                        if (s.weapons[j].enabled && (s.weapons[j].count + s.weapons[j].working) < s.weapons[j].maxCount && hero.progress === 'Idle') {
                            if (EconomyService.decResources(s.weapons[j].cost)) {
                                s.weapons[j].working++;
                                if (hero.academy.id !== HERO_CLASSES[1].id) {
                                    s.gameStats.weaponsAuto++;
                                    ProductionService.buyWeapon(j, false, Math.floor((hero.level * 0.05) * s.weapons[j].prodTime), i);
                                } else {
                                    gainExp(hero, Math.ceil(s.weapons[j].prodTime / 2));
                                    s.gameStats.weaponsAuto++;
                                    ProductionService.buyWeapon(j, false, Math.floor((hero.level * 0.05) * s.weapons[j].prodTime), i);
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
        syncStoreIfBound();
    }

    return {
        bindStore,
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
