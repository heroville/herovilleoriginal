/**
 * Combat/battle resolution: turns, damage, loot, potions.
 * Reads state from the Redux store; dispatches heroes + gameStats slices after mutations.
 * No GameStateService — Redux is the single source of truth.
 */
import { getFlatState, dispatchHeroes, dispatchGameStats } from './stateHelpers.ts';
import { replaceHeroes } from '../store/slices/heroesSlice.ts';
import { replaceGameStats } from '../store/slices/gameStatsSlice.ts';
import {
  HERO_BASE_HEALTH,
  HERO_BASE_XP_THRESHOLD,
  POWER_POTION_DAMAGE_MULTIPLIER,
  TREASURE_HUNTER_LOOT_BONUS,
  MONSTER_XP_MULTIPLIER,
  POTION_REGEN,
  POTION_POWER,
  POTION_HEALTH,
  POTION_GOOD_HEALTH,
  POTION_GREAT_HEALTH,
  BUILDING_TENT,
  STATUS_POISON_TICK_PERCENT,
  STATUS_STUN_SKIP_CHANCE,
  STATUS_ARMOR_BREAK_MULTIPLIER,
  HERO_AUTO_HEAL_THRESHOLD,
} from '../constants/gameConstants.ts';
import type { AppStore } from '../store/index.ts';
import type { Hero, Monster, GameConfig, StatusEffect } from '../types/index.ts';

// suppress unused-import warnings on re-exported action creators
void replaceHeroes;
void replaceGameStats;

interface Journey {
  hero: Hero[];
  dungeon: {
    id: number;
    name: string;
    level: number;
    steps: number;
    encounterRate: number;
    encounterLevel: number;
    bossID: number;
    reward: string;
  };
  steps: number;
}

interface Battle {
  id: number;
  hero: Hero[];
  copyMonsters: Monster[];
  experience: number;
  boss: boolean;
}

interface HeroServiceLike {
  gainExp(hero: Hero, amount: number): void;
}

interface DungeonServiceLike {
  travel(journey: Journey): void;
}

interface GameUiServiceLike {
  showError(msg: string): void;
}

function CombatServiceFactory(
  store: AppStore,
  HeroService: HeroServiceLike,
  DungeonService: DungeonServiceLike,
  GameUiService: GameUiServiceLike,
  GameConfig: GameConfig,
  $timeout: (fn: () => void, ms: number) => void
) {
  const HERO_CLASSES = GameConfig.heroClasses || [];

  function activatePotions(hero: Hero[]): void {
    for (let i = 0; i < hero.length; i++) {
      if (hero[i].equip.potions[POTION_REGEN].count > 0) {
        hero[i].equip.potions[POTION_REGEN].active = true;
      }
      if (hero[i].equip.potions[POTION_POWER].count > 0) {
        hero[i].equip.potions[POTION_POWER].active = true;
      }
    }
  }

  function clearPotions(hero: Hero): void {
    for (let i = 0; i < hero.equip.potions.length; i++) {
      if (hero.equip.potions[i].active) {
        hero.equip.potions[i].count--;
      }
    }
  }

  function heroDamage(hero: Hero): number {
    const economy = store.getState().economy;
    const production = store.getState().production;
    if (hero.equip.weapon.id !== production.weapons[0].id) {
      const weapon = hero.equip.weapon as Hero['equip']['weapon'] & {
        broken?: boolean;
        durability?: number;
        minDamage?: number;
        maxDamage?: number;
      };
      if (weapon.broken === false) {
        if ((weapon.durability ?? 0) <= 0) {
          weapon.minDamage = Math.ceil((weapon.minDamage ?? 0) / 2);
          weapon.maxDamage = Math.ceil((weapon.maxDamage ?? 0) / 2);
          weapon.broken = true;
        } else {
          weapon.durability = (weapon.durability ?? 1) - 1;
        }
      }
      const min = weapon.minDamage ?? 0;
      const max = weapon.maxDamage ?? 0;
      const damage = Math.floor(Math.random() * (max - min + 1)) + min;
      let heroDamageMulti = 1;
      if (hero.equip.potions[POTION_POWER].active === true) {
        heroDamageMulti = POWER_POTION_DAMAGE_MULTIPLIER;
      }
      return Math.ceil(damage * economy.damageMulti * heroDamageMulti);
    }
    return 1 * economy.damageMulti;
  }

  function monstersAlive(monsterList: Monster[]): boolean {
    let dead = 0;
    for (let i = 0; i < monsterList.length; i++) {
      if (monsterList[i].health <= 0) dead++;
    }
    return monsterList.length !== dead;
  }

  function enemyDamage(enemy: Monster): number {
    if (enemy.health <= 0) return 0;
    const min = enemy.minDamage ?? 0;
    const max = enemy.maxDamage ?? 0;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ─── Status Effect Helpers ─────────────────────────────────────────────

  /**
   * Returns true if the entity has an active stun effect (duration > 0).
   * Uses STATUS_STUN_SKIP_CHANCE so future designs can make stun probabilistic.
   */
  function isStunned(entity: { statusEffects?: StatusEffect[] }): boolean {
    if (!entity.statusEffects) return false;
    return entity.statusEffects.some(
      (e) => e.type === 'stun' && e.duration > 0 && Math.random() < STATUS_STUN_SKIP_CHANCE
    );
  }

  /**
   * Applies poison/burn damage and decrements all effect durations by 1.
   * Effects that reach 0 duration are removed.
   * Returns the total tick damage applied (for callers that need to track HP changes).
   */
  function processStatusTick(entity: { currHealth?: number; health?: number; statusEffects?: StatusEffect[] }): number {
    if (!entity.statusEffects || entity.statusEffects.length === 0) return 0;
    let tickDamage = 0;
    entity.statusEffects = entity.statusEffects
      .map((e) => ({ ...e, duration: e.duration - 1 }))
      .filter((e) => e.duration >= 0);
    for (const e of entity.statusEffects) {
      if ((e.type === 'poison' || e.type === 'burn') && entity.health !== undefined && entity.currHealth !== undefined) {
        const dmg = Math.ceil((entity.health * e.magnitude) / 100);
        tickDamage += dmg;
        entity.currHealth = Math.max(0, entity.currHealth - dmg);
      }
    }
    return tickDamage;
  }

  /**
   * Returns the total damage multiplier from armorBreak effects active on the target.
   * If no armor break is present returns 1 (no change). Stacks additively across sources.
   */
  function armorBreakMultiplier(target: { statusEffects?: StatusEffect[] }): number {
    if (!target.statusEffects) return 1;
    const totalBreak = target.statusEffects
      .filter((e) => e.type === 'armorBreak' && e.duration > 0)
      .reduce((sum, e) => sum + e.magnitude, 0);
    return 1 + totalBreak * STATUS_ARMOR_BREAK_MULTIPLIER;
  }

  /**
   * Determines whether a hero should consume a health potion this turn.
   *
   * Triggers when the hero's current HP has fallen below HERO_AUTO_HEAL_THRESHOLD
   * of their max HP (default 50%), the hero actually has that potion, and the
   * global potion stock has an entry for it.
   *
   * Centralising this condition makes it easy to:
   *  - tune the threshold (change HERO_AUTO_HEAL_THRESHOLD in gameConstants)
   *  - unit-test potion behaviour in isolation
   *  - extend with per-hero override thresholds in the future
   */
  function shouldUsePotion(hero: Hero, potionSlot: number, potionDefs: Array<{ value?: number }>): boolean {
    if (!hero.equip.potions[potionSlot] || hero.equip.potions[potionSlot].count <= 0) return false;
    if (!potionDefs[potionSlot]) return false;
    return hero.currHealth < hero.health * HERO_AUTO_HEAL_THRESHOLD;
  }

  // ─── End Status Effect Helpers ─────────────────────────────────────────

  function heroTurn(heroL: Hero[], enemyL: Monster[]): Monster[] {
    const potions = store.getState().production.potions as Array<{ value?: number }>;
    let damage = 0;

    // Process per-hero status ticks (poison/burn) and accumulate damage from living, non-stunned heroes.
    for (let i = 0; i < heroL.length; i++) {
      if (heroL[i].currHealth > 0) {
        processStatusTick(heroL[i]);
        if (heroL[i].currHealth <= 0) continue; // died from status tick
        if (isStunned(heroL[i])) continue;       // stunned: skip this hero's attack
        if (heroL[i].equip.potions[POTION_REGEN].active) {
          const regenVal = potions[POTION_REGEN] ? (potions[POTION_REGEN].value ?? 0) : 0;
          const healPct = Math.floor((heroL[i].health / 100) * regenVal);
          heroL[i].currHealth = Math.min(heroL[i].health, heroL[i].currHealth + healPct);
        }
        damage += heroDamage(heroL[i]);
      }
    }

    // Distribute cumulative hero damage sequentially through enemies.
    // armorBreakMultiplier is applied per-enemy target so a broken-armored enemy
    // takes proportionally more damage from the hero's share.
    const tempDead: Monster[] = [];
    for (let i = 0; i < enemyL.length; i++) {
      if (enemyL[i].health === 0) {
        // already dead
      } else {
        // Process monster status ticks (poison etc.) at the start of its "receive damage" step.
        processStatusTick(enemyL[i]);
        const effectiveDamage = Math.ceil(damage * armorBreakMultiplier(enemyL[i]));
        if (enemyL[i].health <= effectiveDamage) {
          enemyL[i].health = 0;
          tempDead.push(enemyL[i]);
          damage = 0;
        } else {
          enemyL[i].health -= effectiveDamage;
          damage = 0;
        }
      }
    }
    return tempDead;
  }

  function enemyTurn(hero: Hero[], monsterList: Monster[]): boolean {
    const potions = store.getState().production.potions as Array<{ value?: number }>;
    let turnDamage = 0;
    for (let i = 0; i < monsterList.length; i++) {
      // Stunned monsters skip their attack for this turn.
      if (monsterList[i].health > 0 && !isStunned(monsterList[i])) {
        turnDamage += enemyDamage(monsterList[i]);
      }
    }
    let dead = 0;
    for (let k = 0; k < hero.length; k++) {
      if (hero[k].currHealth <= 0) dead++;
    }
    for (let k = 0; k < hero.length; k++) {
      if (hero[k].currHealth <= 0) {
        // already dead
      } else if (hero[k].currHealth <= turnDamage / (hero.length - dead)) {
        hero[k].currHealth = 0;
        dead++;
      } else {
        let heroDamageAmount = Math.floor(turnDamage / (hero.length - dead));
        if (k < heroDamageAmount % (hero.length - dead)) {
          heroDamageAmount++;
        }
        hero[k].currHealth -= heroDamageAmount;
        // Try best available health potion first (great → good → basic).
        // shouldUsePotion triggers when HP drops below HERO_AUTO_HEAL_THRESHOLD.
        if (shouldUsePotion(hero[k], POTION_GREAT_HEALTH, potions)) {
          hero[k].equip.potions[POTION_GREAT_HEALTH].count--;
          hero[k].currHealth = Math.min(hero[k].health, hero[k].currHealth + (potions[POTION_GREAT_HEALTH].value ?? 0));
        } else if (shouldUsePotion(hero[k], POTION_GOOD_HEALTH, potions)) {
          hero[k].equip.potions[POTION_GOOD_HEALTH].count--;
          hero[k].currHealth = Math.min(hero[k].health, hero[k].currHealth + (potions[POTION_GOOD_HEALTH].value ?? 0));
        } else if (shouldUsePotion(hero[k], POTION_HEALTH, potions)) {
          hero[k].equip.potions[POTION_HEALTH].count--;
          hero[k].currHealth = Math.min(hero[k].health, hero[k].currHealth + (potions[POTION_HEALTH].value ?? 0));
        }
      }
    }
    return hero.length === dead;
  }

  function addLoot(item: string | null | undefined, hero: Hero): void {
    if (item == null) return;
    const itemsplit = item.split(';');
    const itemType = itemsplit[1];
    let itemValue: number = parseInt(itemsplit[2], 10);
    if (HERO_CLASSES[2] && hero.academy && hero.academy.id === HERO_CLASSES[2].id) {
      itemValue += Math.ceil(itemValue * TREASURE_HUNTER_LOOT_BONUS);
    }
    switch (itemType) {
      case 'j':
        hero.equip.scrap += itemValue;
        break;
      case 'g':
        hero.equip.gold += itemValue;
        break;
    }
  }

  function takeTurn(battle: Battle, journey: Journey): void {
    const s = getFlatState(store);
    const hero = journey.hero;
    const monstersList = battle.copyMonsters;

    heroTurn(hero, monstersList);

    if (!monstersAlive(monstersList)) {
      s.gameStats.wins++;
      for (let i = 1; i < hero.length; i++) {
        clearPotions(hero[i]);
      }
      for (let j = 0; j < monstersList.length; j++) {
        for (let i = 0; i < hero.length; i++) {
          if (hero[i].level <= journey.dungeon.level * 2) {
            battle.experience += monstersList[j].value * MONSTER_XP_MULTIPLIER;
          }
        }
        // Loot is assigned once per monster and given to one hero (round-robin).
        // This prevents party size from multiplying gold/scrap rewards.
        const lootChance = Math.random() * 100;
        if (lootChance < 10 && monstersList[j].high != null) {
          const lootRecipient = hero[j % hero.length];
          addLoot(monstersList[j].high, lootRecipient);
        }
      }
      if (battle.boss) {
        for (let i = 0; i < hero.length; i++) {
          if (hero[i].dungeon + 1 < s.dungeons.length) {
            if (hero[i].clearCount >= s.successCount.amount) {
              hero[i].dungeon++;
              hero[i].clearCount = 0;
            } else {
              hero[i].clearCount++;
            }
          }
          hero[i].location = 'Home';
          hero[i].progress = 'Resting';
          addLoot(journey.dungeon.reward, hero[i]);
        }
      } else {
        for (let k = 0; k < hero.length; k++) {
          journey.steps++;
          hero[k].progress =
            Math.round((journey.steps / journey.dungeon.steps) * 100) + '%' + ' Complete';
        }
        const gameLoop = store.getState().config.gameLoop;
        $timeout(function () {
          DungeonService.travel(journey);
        }, gameLoop);
      }
      for (let i = 0; i < hero.length; i++) {
        HeroService.gainExp(hero[i], battle.experience);
      }
      s.battles.splice(s.battles.findIndex((b) => b.id === battle.id), 1);
      // Sync hero mutations from journey.hero back to the flat snapshot
      for (const h of hero) {
        const idx = s.heroList.findIndex((hl) => hl.id === h.id);
        if (idx !== -1) s.heroList[idx] = h;
      }
      dispatchHeroes(store, s);
      dispatchGameStats(store, s);
    } else if (enemyTurn(hero, monstersList)) {
      s.battles.splice(s.battles.findIndex((b) => b.id === battle.id), 1);
      s.gameStats.losses++;
      const weapons = store.getState().production.weapons;
      for (let i = 0; i < hero.length; i++) {
        hero[i].location = 'Home';
        hero[i].currHealth = 0;
        hero[i].progress = 'Resting';
        hero[i].equip.weapon = structuredClone(weapons[0]) as Hero['equip']['weapon'];
        clearPotions(hero[i]);
        if (s.buildings[BUILDING_TENT].tier === 1) {
          hero[i].experience = 0;
          hero[i].equip.scrap = 0;
          hero[i].equip.gold = 0;
          hero[i].level = 1;
          hero[i].next = HERO_BASE_XP_THRESHOLD;
          hero[i].health = HERO_BASE_HEALTH;
          hero[i].dungeon = 0;
          GameUiService.showError(
            'A hero has lost a fight, he has also lost all his progress and must start again.'
          );
        } else {
          hero[i].dungeon =
            hero[i].dungeon - s.lossCount.amount > 0 ? hero[i].dungeon - s.lossCount.amount : 0;
          GameUiService.showError(
            'A hero lost a fight, he has respawned in town and must heal before fighting.'
          );
        }
      }
      // Sync hero mutations back
      for (const h of hero) {
        const idx = s.heroList.findIndex((hl) => hl.id === h.id);
        if (idx !== -1) s.heroList[idx] = h;
      }
      dispatchHeroes(store, s);
      dispatchGameStats(store, s);
    } else {
      // Sync progress updates after each turn
      const currentHeroes = store.getState().heroes;
      const updatedHeroList = currentHeroes.heroList.map((hl) => {
        const inBattle = hero.find((h) => h.id === hl.id);
        // Clone so Immer does not freeze the live journey.hero objects
        return inBattle ? structuredClone(inBattle) : hl;
      });
      // Replace this battle in the array with a clone of the live object so
      // copyMonsters (enemy HP) reflects the mutations made by heroTurn()
      const updatedBattles = currentHeroes.battles.map((b) =>
        b.id === battle.id ? structuredClone(battle) : b
      );
      store.dispatch(
        replaceHeroes({
          ...currentHeroes,
          heroList: updatedHeroList,
          battles: updatedBattles,
        })
      );
      const gameLoop = store.getState().config.gameLoop;
      $timeout(function () {
        takeTurn(battle, journey);
      }, gameLoop);
    }
  }

  function startFight(monList: Monster[], journey: Journey, boss: boolean): void {
    const s = getFlatState(store);
    const thisBattle: Battle = {
      id: s.battles.length,
      hero: journey.hero,
      copyMonsters: monList.slice(),
      experience: 0,
      boss: boss,
    };
    s.battles.push(thisBattle);
    dispatchHeroes(store, s);
    activatePotions(journey.hero);
    takeTurn(thisBattle, journey);
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
    addLoot,
  };
}

export type CombatServiceInstance = ReturnType<typeof CombatServiceFactory>;

export default CombatServiceFactory;
