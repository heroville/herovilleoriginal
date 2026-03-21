/**
 * Hero and worker creation, profession/class changes, XP, healing, name generation.
 * Reads state from the Redux store via getFlatState; dispatches slice actions after mutations.
 * No GameStateService — Redux is the single source of truth.
 */
import { getFlatState, dispatchHeroes, dispatchProduction, dispatchJobs, dispatchConfig } from './stateHelpers.ts';
import {
  HERO_BASE_HEALTH,
  HERO_BASE_XP_THRESHOLD,
  HERO_HEALTH_PER_LEVEL,
  HERO_XP_PER_LEVEL,
  HERO_REST_HEAL_PERCENT,
  WEAPON_DURABILITY_LOW_THRESHOLD,
  BUILDING_BLACKSMITH,
  BUILDING_TAVERN,
  WORKER_PROD_SPEED_PER_LEVEL,
  WORKER_XP_PER_CRAFT,
} from '../constants/gameConstants.ts';
import type { AppStore } from '../store/index.ts';
import type { GameConfig, Hero, FlatGameState, EconomyServiceType } from '../types/index.ts';
import type { GameUiServiceInstance } from './gameUi.service.ts';

interface ProductionServiceLike {
  activateBlueprint(value: number): void;
  createPotion(button: boolean, start: number, heroID: number, onDone?: () => void): void;
  createPotions(potionID: number, button: boolean, start: number, heroID: number, onDone?: () => void): void;
  buyWeapon(weaponID: number, button: boolean, start: number, heroID: number, onDone?: () => void): void;
}

interface UtilServiceLike {
  meetRequirements(hero: Hero, weapon: FlatGameState['weapons'][number]): boolean;
}

const DEFAULT_POTIONS = [
  { id: 0, name: 'Regeneration', count: 0, active: false },
  { id: 1, name: 'Power', count: 0, active: false },
  { id: 2, name: 'Health', count: 0, active: false },
  { id: 3, name: 'Good Health', count: 0, active: false },
  { id: 4, name: 'Great Health', count: 0, active: false },
];

function HeroServiceFactory(
  GameConfig: GameConfig,
  EconomyService: EconomyServiceType,
  store: AppStore,
  GameUiService: GameUiServiceInstance,
  DungeonService: { attemptDungeon(dungeonID: number, hero: Hero[]): void },
  ProductionService: ProductionServiceLike,
  UtilService: UtilServiceLike
) {
  const HERO_CLASSES = GameConfig.heroClasses || [];

  function defaultEquip() {
    const s = getFlatState(store);
    return {
      weapon: structuredClone(s.weapons[0]),
      potions: structuredClone(DEFAULT_POTIONS),
      gold: 0,
      scrap: 0,
    };
  }

  function addHero(heroName: string): void {
    if (typeof heroName !== 'string' || heroName.trim() === '') {
      throw new Error('addHero: heroName must be a non-empty string');
    }
    const s = getFlatState(store);
    s.heroList.push({
      id: s.heroList.length,
      name: heroName,
      currHealth: HERO_BASE_HEALTH,
      health: HERO_BASE_HEALTH,
      level: 1,
      experience: 0,
      next: HERO_BASE_XP_THRESHOLD,
      equip: defaultEquip(),
      location: 'Home',
      progress: 'Idle',
      dungeon: 0,
      clearCount: 0,
      working: false,
      job: s.jobs[0],
      academy: s.heroClass[2],
      party: false,
    });
    dispatchHeroes(store, s);
  }

  function addWorker(heroName: string): void {
    if (typeof heroName !== 'string' || heroName.trim() === '') {
      throw new Error('addWorker: heroName must be a non-empty string');
    }
    const s = getFlatState(store);
    s.heroList.push({
      id: s.heroList.length,
      name: heroName,
      currHealth: HERO_BASE_HEALTH,
      health: HERO_BASE_HEALTH,
      level: 1,
      experience: 0,
      next: HERO_BASE_XP_THRESHOLD,
      equip: defaultEquip(),
      location: 'Home',
      progress: 'Idle',
      dungeon: 0,
      clearCount: 0,
      working: false,
      job: s.jobs[0],
      academy: s.heroClass[1],
      party: false,
    });
    dispatchHeroes(store, s);
  }

  function newHeroName(): string {
    const s = getFlatState(store);
    if (!s.heroName || !s.heroName.first || !s.heroName.title) {
      return 'Hero ' + s.heroList.length;
    }
    const randFirst = Math.floor(Math.random() * s.heroName.first.length);
    let newName = s.heroName.first[randFirst] + ' ';
    const randTitle = Math.floor(Math.random() * s.heroName.title.length);
    newName += s.heroName.title[randTitle];
    const exist = s.heroList.some((h) => h.name === newName);
    if (exist) return newHeroName();
    return newName;
  }

  function heroProfession(selectedJobID: number, heroID: number): void {
    const s = getFlatState(store);
    if (selectedJobID == null || heroID == null) return;
    if (selectedJobID < 0 || selectedJobID >= s.jobs.length) return;
    if (heroID < 0 || heroID >= s.heroList.length) return;
    const count = s.heroList.filter((h) => h.job.id === selectedJobID).length;
    if (count >= (s.jobs[selectedJobID] && s.jobs[selectedJobID].limit)) {
      GameUiService.showError(
        'You can not have another hero doing ' + s.jobs[selectedJobID].name + '.'
      );
      return;
    }
    s.jobs[selectedJobID].current++;
    s.heroList[heroID].progress = 'Idle';
    s.heroList[heroID].job = s.jobs[selectedJobID];
    dispatchHeroes(store, s);
    dispatchJobs(store, s);
  }

  function heroClassChange(selectedClassID: number, heroID: number): void {
    const s = getFlatState(store);
    if (selectedClassID == null || heroID == null) return;
    if (selectedClassID < 0 || selectedClassID >= s.heroClass.length) return;
    if (heroID < 0 || heroID >= s.heroList.length) return;
    s.tempClass = s.heroClass[selectedClassID];
    s.tempHero = heroID;
    dispatchConfig(store, s);
  }

  function confirmClass(): void {
    const s = getFlatState(store);
    const hero = s.heroList[s.tempHero!];
    const cls = s.tempClass;
    if (!hero || !cls) return;
    hero.academy = cls;
    if (HERO_CLASSES[1] && cls.id === HERO_CLASSES[1].id) {
      hero.progress = 'Idle';
    }
    s.tempClass = null;
    s.tempHero = null;
    dispatchHeroes(store, s);
    dispatchConfig(store, s);
  }

  /** Mutates hero in-place (called from combat/dungeon while holding a flat state snapshot). */
  function gainExp(hero: Hero, amount: number): void {
    const s = getFlatState(store);
    hero.experience += amount;
    if (hero.experience >= hero.next) {
      hero.level++;
      hero.next += hero.level * HERO_XP_PER_LEVEL;
      hero.health += HERO_HEALTH_PER_LEVEL;
      hero.experience = 0;
      if (
        s.buildings[BUILDING_TAVERN] &&
        hero.level >= 3 &&
        s.buildings[BUILDING_TAVERN].count === 0 &&
        !s.buildings[BUILDING_TAVERN].enabled
      ) {
        ProductionService.activateBlueprint(2);
      }
    }
  }

  /** Mutates hero in-place (called from combat/dungeon while holding a flat state snapshot). */
  function heal(heroID: number, amount: number, flag?: number): void {
    const s = getFlatState(store);
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

  function rest(): void {
    const s = getFlatState(store);
    for (let i = 0; i < s.heroList.length; i++) {
      const hero = s.heroList[i];
      const weapon = hero.equip.weapon;
      if (hero.location !== 'Home') continue;
      if (hero.equip.gold > 0) {
        if (s.buildings[BUILDING_BLACKSMITH].count > hero.equip.weapon.id) {
          for (let j = s.buildings[BUILDING_BLACKSMITH].count; j > hero.equip.weapon.id; j--) {
            if (UtilService.meetRequirements(hero, s.weapons[j])) {
              if (hero.equip.gold >= (s.weapons[j].sellPrice ?? 0) && s.weapons[j].count > 0) {
                hero.equip.gold -= s.weapons[j].sellPrice ?? 0;
                s.weapons[j].count--;
                EconomyService.incGold(s.weapons[j].sellPrice ?? 0);
                hero.equip.weapon = structuredClone(s.weapons[j]);
                j = 0;
              }
            }
          }
        }
        if (
          (weapon.durability <= (s.weapons[weapon.id]?.durability ?? 0) * WEAPON_DURABILITY_LOW_THRESHOLD ||
            (weapon as unknown as { minDamage: number }).minDamage < (s.weapons[weapon.id] as unknown as { minDamage: number })?.minDamage) &&
          hero.equip.gold >= (weapon.sellPrice ?? 0) &&
          s.weapons[weapon.id].count > 0
        ) {
          hero.equip.gold -= weapon.sellPrice ?? 0;
          s.weapons[weapon.id].count--;
          hero.equip.weapon = structuredClone(s.weapons[weapon.id]);
        }
        for (let k = 0; k < hero.equip.potions.length; k++) {
          const potionK = s.potions[k] as FlatGameState['potions'][number] & { maxHero?: number };
          if (
            potionK &&
            hero.equip.potions[k].count < (potionK.maxHero ?? 0) &&
            hero.equip.gold >= (potionK.sellPrice ?? 0) &&
            potionK.count > 0
          ) {
            hero.equip.gold -= potionK.sellPrice ?? 0;
            EconomyService.incGold(potionK.sellPrice ?? 0);
            potionK.count--;
            hero.equip.potions[k].count++;
          }
        }
        if (
          hero.health - hero.currHealth >= (s.potion.healing ?? 0) &&
          s.potion.count > 0 &&
          s.gold + s.potion.sellPrice <= s.maxGold &&
          hero.equip.gold >= s.potion.sellPrice
        ) {
          hero.equip.gold -= s.potion.sellPrice;
          EconomyService.incGold(s.potion.sellPrice);
          s.potion.count--;
          const healAmount = Math.floor((hero.health / 100) * (s.potion.healing ?? 0));
          hero.currHealth = Math.min(hero.health, hero.currHealth + healAmount);
        }
      }
      // Passive rest heal
      const restHealAmount = Math.floor((hero.health / 100) * HERO_REST_HEAL_PERCENT);
      hero.currHealth = Math.min(hero.health, hero.currHealth + restHealAmount);
      if (
        hero.currHealth === hero.health &&
        (hero.academy.id === HERO_CLASSES[0].id || hero.academy.id === HERO_CLASSES[2].id)
      ) {
        DungeonService.attemptDungeon(hero.dungeon, [hero]);
        hero.location = s.dungeons[hero.dungeon].name;
      } else if (hero.progress === 'Idle') {
        EconomyService.incrRes(Math.ceil(s.heroList[i].level / 4) ^ 2);
      }
    }
    dispatchHeroes(store, s);
    dispatchProduction(store, s);
  }

  function work(): void {
    const s = getFlatState(store);
    for (let i = 0; i < s.heroList.length; i++) {
      const hero = s.heroList[i];
      switch (hero.job.id) {
        case 0:
          break;
        case 1: {
          if (s.potion.count + s.potion.working < s.potion.maxCount && hero.progress === 'Idle') {
            if (EconomyService.decResources(s.potion.cost)) {
              s.potion.working++;
              if (hero.academy.id !== HERO_CLASSES[1].id) {
                ProductionService.createPotion(
                  false,
                  Math.floor(hero.level * WORKER_PROD_SPEED_PER_LEVEL * s.potion.prodTime),
                  i
                );
              } else {
                gainExp(hero, Math.ceil(s.potion.prodTime / WORKER_XP_PER_CRAFT));
                ProductionService.createPotion(
                  false,
                  Math.floor(hero.level * WORKER_PROD_SPEED_PER_LEVEL * s.potion.prodTime),
                  i
                );
              }
            }
          }
          for (let j = 0; j < s.potions.length; j++) {
            if (
              s.potions[j].enabled &&
              s.potions[j].count + s.potions[j].working < s.potions[j].maxCount &&
              hero.progress === 'Idle'
            ) {
              if (EconomyService.decResources(s.potions[j].cost)) {
                s.potions[j].working++;
                if (hero.academy.id !== HERO_CLASSES[1].id) {
                  ProductionService.createPotions(
                    j,
                    false,
                    Math.floor(hero.level * WORKER_PROD_SPEED_PER_LEVEL * s.potions[j].prodTime),
                    i
                  );
                } else {
                  gainExp(hero, Math.ceil(s.potions[j].prodTime / WORKER_XP_PER_CRAFT));
                  ProductionService.createPotions(
                    j,
                    false,
                    Math.floor(hero.level * WORKER_PROD_SPEED_PER_LEVEL * s.potions[j].prodTime),
                    i
                  );
                }
              }
            }
          }
          break;
        }
        case 2: {
          for (let j = 0; j < s.weapons.length; j++) {
            if (
              s.weapons[j].enabled &&
              s.weapons[j].count + s.weapons[j].working < s.weapons[j].maxCount &&
              hero.progress === 'Idle'
            ) {
              if (EconomyService.decResources(s.weapons[j].cost)) {
                s.weapons[j].working++;
                const wProdTime = (s.weapons[j] as { prodTime?: number }).prodTime ?? 0;
                if (hero.academy.id !== HERO_CLASSES[1].id) {
                  s.gameStats.weaponsAuto++;
                  ProductionService.buyWeapon(
                    j,
                    false,
                    Math.floor(hero.level * WORKER_PROD_SPEED_PER_LEVEL * wProdTime),
                    i
                  );
                } else {
                  gainExp(hero, Math.ceil(wProdTime / WORKER_XP_PER_CRAFT));
                  s.gameStats.weaponsAuto++;
                  ProductionService.buyWeapon(
                    j,
                    false,
                    Math.floor(hero.level * WORKER_PROD_SPEED_PER_LEVEL * wProdTime),
                    i
                  );
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
    dispatchHeroes(store, s);
    dispatchProduction(store, s);
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
    work,
  };
}

export type HeroServiceInstance = ReturnType<typeof HeroServiceFactory>;

export default HeroServiceFactory;
