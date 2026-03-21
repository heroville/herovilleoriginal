/**
 * Combat/battle resolution: turns, damage, loot, potions.
 * When store is bound via bindStore(store), dispatches REPLACE_STATE after takeTurn mutations (battles, heroes, gameStats).
 */
import { REPLACE_STATE } from '../store/sliceState.js';
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
} from '../constants/gameConstants.js';

function CombatServiceFactory(
  GameStateService,
  HeroService,
  DungeonService,
  GameUiService,
  GameConfig,
  $timeout
) {
  const HERO_CLASSES = GameConfig.heroClasses || [];
  var _dispatch = null;

  function bindStore(store) {
    if (store) _dispatch = store.dispatch;
  }

  function syncStoreIfBound() {
    if (_dispatch) {
      const flat = GameStateService.getState();
      _dispatch({ type: REPLACE_STATE, payload: JSON.parse(JSON.stringify(flat)) });
    }
  }

  function activatePotions(hero) {
    for (let i = 0; i < hero.length; i++) {
      if (hero[i].equip.potions[POTION_REGEN].count > 0) {
        hero[i].equip.potions[POTION_REGEN].active = true;
      }
      if (hero[i].equip.potions[POTION_POWER].count > 0) {
        hero[i].equip.potions[POTION_POWER].active = true;
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

  function heroDamage(hero) {
    const s = GameStateService.getState();
    if (hero.equip.weapon.id !== s.weapons[0].id) {
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
      if (hero.equip.potions[POTION_POWER].active === true) {
        heroDamageMulti = POWER_POTION_DAMAGE_MULTIPLIER;
      }
      return Math.ceil(damage * s.damageMulti * heroDamageMulti);
    }
    return 1 * s.damageMulti;
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

  function heroTurn(heroL, enemyL) {
    const s = GameStateService.getState();
    let damage = 0;
    for (let i = 0; i < heroL.length; i++) {
      if (heroL[i].currHealth > 0) {
        if (heroL[i].equip.potions[POTION_REGEN].active) {
          HeroService.heal(i, s.potions[POTION_REGEN].value, 1);
        }
        damage += heroDamage(heroL[i]);
      }
    }
    const tempDead = [];
    for (let i = 0; i < enemyL.length; i++) {
      if (enemyL[i].health === 0) {
        // already dead
      } else if (enemyL[i].health < damage) {
        enemyL[i].health = 0;
        tempDead.push(enemyL[i]);
        damage = 0;
      } else {
        enemyL[i].health -= damage;
        damage = 0;
      }
    }
    return tempDead;
  }

  function enemyTurn(hero, monsterList) {
    const s = GameStateService.getState();
    let turnDamage = 0;
    for (let i = 0; i < monsterList.length; i++) {
      if (monsterList[i].health > 0) {
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
        const potions = s.potions;
        if (
          hero[k].equip.potions[POTION_GREAT_HEALTH] &&
          hero[k].equip.potions[POTION_GREAT_HEALTH].count > 0 &&
          hero[k].health - hero[k].currHealth > potions[POTION_GREAT_HEALTH].value
        ) {
          hero[k].equip.potions[POTION_GREAT_HEALTH].count--;
          HeroService.heal(k, potions[POTION_GREAT_HEALTH].value);
        } else if (
          hero[k].equip.potions[POTION_GOOD_HEALTH] &&
          hero[k].equip.potions[POTION_GOOD_HEALTH].count > 0 &&
          hero[k].health - hero[k].currHealth > potions[POTION_GOOD_HEALTH].value
        ) {
          hero[k].equip.potions[POTION_GOOD_HEALTH].count--;
          HeroService.heal(k, potions[POTION_GOOD_HEALTH].value);
        } else if (
          hero[k].equip.potions[POTION_HEALTH] &&
          hero[k].equip.potions[POTION_HEALTH].count > 0 &&
          hero[k].health - hero[k].currHealth > potions[POTION_HEALTH].value
        ) {
          hero[k].equip.potions[POTION_HEALTH].count--;
          HeroService.heal(k, potions[POTION_HEALTH].value);
        }
      }
    }
    return hero.length === dead;
  }

  function addLoot(item, hero) {
    if (item == null) return;
    const itemsplit = item.split(';');
    const itemType = itemsplit[1];
    let itemValue = itemsplit[2];
    if (HERO_CLASSES[2] && hero.academy && hero.academy.id === HERO_CLASSES[2].id) {
      itemValue += Math.ceil(itemValue * TREASURE_HUNTER_LOOT_BONUS);
    }
    switch (itemType) {
      case 'j':
        hero.equip.scrap += parseInt(itemValue, 10);
        break;
      case 'g':
        hero.equip.gold += parseInt(itemValue, 10);
        break;
    }
  }

  function takeTurn(battle, journey) {
    const s = GameStateService.getState();
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
          const lootChance = Math.random() * 100;
          if (lootChance < 10 && monstersList[j].high != null) {
            addLoot(monstersList[j].high, hero[i]);
          }
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
        $timeout(function () {
          DungeonService.travel(journey);
        }, s.gameLoop);
      }
      for (let i = 0; i < hero.length; i++) {
        HeroService.gainExp(hero[i], battle.experience);
      }
      s.battles.splice(s.battles.indexOf(battle), 1);
      syncStoreIfBound();
    } else if (enemyTurn(hero, monstersList)) {
      s.battles.splice(s.battles.indexOf(battle), 1);
      s.gameStats.losses++;
      for (let i = 0; i < hero.length; i++) {
        hero[i].location = 'Home';
        hero[i].currHealth = 0;
        hero[i].progress = 'Resting';
        hero[i].equip.weapon = JSON.parse(JSON.stringify(s.weapons[0]));
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
      syncStoreIfBound();
    } else {
      syncStoreIfBound();
      $timeout(function () {
        takeTurn(battle, journey);
      }, s.gameLoop);
    }
  }

  function startFight(monList, journey, boss) {
    const s = GameStateService.getState();
    const thisBattle = {
      id: s.battles.length,
      hero: journey.hero,
      copyMonsters: monList.slice(),
      experience: 0,
      boss: boss,
    };
    s.battles.push(thisBattle);
    activatePotions(journey.hero);
    takeTurn(thisBattle, journey);
  }

  return {
    bindStore,
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

export default CombatServiceFactory;
