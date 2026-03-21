/**
 * Dungeon, monster, boss creation, and journey flow.
 * When store is bound via bindStore(store), dispatches REPLACE_STATE after activateDungeon, travel (progress), and monsterFight.
 */
import { createStoreBinding } from './storeSync.js';
import {
  MONSTERS_PER_BATCH,
  MONSTER_HEALTH_MULTIPLIER,
  MONSTER_LOOT_MULTIPLIER,
  BOSS_LEVEL_OFFSET,
  DUNGEON_STEPS_MULTIPLIER,
  MAX_MONSTERS_PER_ENCOUNTER,
  MULTI_HERO_SCALE_FACTOR,
} from '../constants/gameConstants.js';

function DungeonServiceFactory(GameStateService, $timeout, $injector) {
  const { bindStore, syncStoreIfBound } = createStoreBinding(() => GameStateService.getState());

  function dungeonName() {
    const s = GameStateService.getState();
    if (!s.dungeonNames || !s.dungeonNames.dungeons) return 'Dungeon';
    const usedNames = new Set(s.dungeons.map((d) => d.name));
    const available = s.dungeonNames.dungeons.filter((name) => !usedNames.has(name));
    if (available.length === 0) return 'Dungeon';
    return available[Math.floor(Math.random() * available.length)];
  }

  function createMonster(level) {
    const s = GameStateService.getState();
    if (!s.monsterList || !s.monsterList.monsters) return;
    const usedNames = new Set(s.monsters.map((m) => m.name));
    const available = s.monsterList.monsters.filter((m) => !usedNames.has(m.name));
    for (let i = 0; i < MONSTERS_PER_BATCH; i++) {
      if (available.length === 0) break;
      const idx = Math.floor(Math.random() * available.length);
      const randomMax = Math.ceil(Math.random() * (level * level + 1));
      const randomMin = Math.ceil(Math.random() * randomMax);
      const averagedmg = Math.ceil((randomMax + randomMin) / 2);
      const mobHealth = Math.floor(
        ((MONSTER_HEALTH_MULTIPLIER * level) / averagedmg) * (level * level)
      );
      s.monsters.push({
        id: s.monsters.length,
        name: available[idx].name,
        value: level,
        minDamage: randomMin,
        maxDamage: randomMax,
        health: mobHealth,
        low: 'Junk;j;' + level * MONSTER_LOOT_MULTIPLIER,
        high: 'Gold;g;' + level,
      });
      available.splice(idx, 1);
    }
  }

  function createBoss(level) {
    const s = GameStateService.getState();
    if (!s.monsterList || !s.monsterList.monsters) return;
    level += BOSS_LEVEL_OFFSET;
    const usedNames = new Set(s.bosses.map((b) => b.name));
    const available = s.monsterList.monsters.filter((m) => !usedNames.has(m.name));
    if (available.length === 0) return;
    const idx = Math.floor(Math.random() * available.length);
    const randomMax = Math.ceil(Math.random() * (level * level + 1));
    const randomMin = Math.ceil(Math.random() * randomMax);
    const averagedmg = Math.ceil((randomMax + randomMin) / 2);
    const mobHealth = Math.floor(
      ((MONSTER_HEALTH_MULTIPLIER * level) / averagedmg) * (level * level)
    );
    s.bosses.push({
      id: s.bosses.length,
      name: available[idx].name,
      value: level,
      minDamage: randomMin,
      maxDamage: randomMax,
      health: mobHealth,
      low: 'Junk;j;' + level * MONSTER_LOOT_MULTIPLIER,
      high: 'Gold;g;' + level,
    });
  }

  function activateDungeon() {
    const s = GameStateService.getState();
    s.dungeons.push({
      id: s.dungeons.length,
      name: dungeonName(),
      level: s.dungeons.length + 1,
      steps: DUNGEON_STEPS_MULTIPLIER * (s.dungeons.length + 1),
      encounterRate: DUNGEON_STEPS_MULTIPLIER + Math.floor(Math.random() * 6),
      encounterLevel: s.dungeons.length + 2,
      bossID: s.dungeons.length,
      enabled: true,
      reward: 'Gold;g;' + (s.dungeons.length + 1),
    });
    createMonster(s.dungeons.length);
    createBoss(s.dungeons.length - 1);
    syncStoreIfBound();
  }

  function attemptDungeon(dungeonID, hero) {
    const s = GameStateService.getState();
    const dungeon = s.dungeons[dungeonID];
    const journey = { hero, dungeon, steps: 0 };
    $timeout(function () {
      travel(journey);
    }, s.gameLoop);
  }

  function travel(journey) {
    if (journey.steps === journey.dungeon.steps) {
      for (let i = 0; i < journey.hero.length; i++) {
        journey.hero[i].progress = 'Fighting Boss!';
      }
      syncStoreIfBound();
      bossFight(journey);
    } else {
      const roll = Math.floor(Math.random() * 100 + 1);
      if (roll < journey.dungeon.encounterRate) {
        monsterFight(journey);
        for (let i = 0; i < journey.hero.length; i++) {
          journey.hero[i].progress = 'Fighting Encounter!';
        }
        syncStoreIfBound();
      } else {
        journey.steps++;
        for (let i = 0; i < journey.hero.length; i++) {
          journey.hero[i].progress =
            Math.round((journey.steps / journey.dungeon.steps) * 100) + '%' + ' Complete';
        }
        syncStoreIfBound();
        const s = GameStateService.getState();
        $timeout(function () {
          travel(journey);
        }, s.gameLoop);
      }
    }
  }

  function monsterFight(journey) {
    const s = GameStateService.getState();
    const eLevel = journey.dungeon.encounterLevel;
    const validMonsters = [];
    const encounterMonsters = [];
    let monsterCount = 0;
    let currLevel = 0;
    const copyMonsters = s.monsters.slice();
    for (let i = 0; i < copyMonsters.length; i++) {
      if (
        copyMonsters[i].value >= Math.floor(eLevel / MAX_MONSTERS_PER_ENCOUNTER) &&
        copyMonsters[i].value <= eLevel
      ) {
        validMonsters.push(copyMonsters[i]);
      }
    }
    while (
      monsterCount < MAX_MONSTERS_PER_ENCOUNTER &&
      currLevel < eLevel &&
      eLevel - currLevel >= Math.floor(eLevel / MAX_MONSTERS_PER_ENCOUNTER)
    ) {
      const reducedMonster = [];
      for (let i = 0; i < validMonsters.length; i++) {
        if (validMonsters[i].value <= eLevel - currLevel) {
          reducedMonster.push(validMonsters[i]);
        }
      }
      const currentMonster = Math.floor(Math.random() * reducedMonster.length);
      const multi = journey.hero.length > 1 ? MULTI_HERO_SCALE_FACTOR : 1;
      encounterMonsters.push({
        id: encounterMonsters.length,
        name: reducedMonster[currentMonster].name,
        value: reducedMonster[currentMonster].value * multi,
        minDamage: reducedMonster[currentMonster].minDamage * multi,
        maxDamage: reducedMonster[currentMonster].maxDamage * multi,
        health: reducedMonster[currentMonster].health * multi,
        maxHealth: reducedMonster[currentMonster].health * multi,
        low: 'Junk;j;' + parseInt(reducedMonster[currentMonster].value * 3 * multi),
        high: 'Gold;g;' + parseInt(reducedMonster[currentMonster].value * multi),
      });
      monsterCount++;
      currLevel += reducedMonster[currentMonster].value;
    }
    syncStoreIfBound();
    $injector.get('CombatService').startFight(encounterMonsters, journey, false);
  }

  function bossFight(journey) {
    const s = GameStateService.getState();
    const bossID = journey.dungeon.bossID;
    const multi = journey.hero.length > 1 ? MULTI_HERO_SCALE_FACTOR : 1;
    const bossBattle = [
      {
        name: s.bosses[bossID].name,
        value: s.bosses[bossID].value * multi,
        minDamage: s.bosses[bossID].minDamage * multi,
        maxDamage: s.bosses[bossID].maxDamage * multi,
        health: s.bosses[bossID].health * multi,
        maxHealth: s.bosses[bossID].health * multi,
        high: 'Junk;j;' + parseInt(s.bosses[bossID].value * multi * 3),
        low: 'Gold;g;' + parseInt(s.bosses[bossID].value * multi),
      },
    ];
    $injector.get('CombatService').startFight(bossBattle.slice(), journey, true);
  }

  return {
    bindStore,
    activateDungeon,
    createMonster,
    createBoss,
    dungeonName,
    attemptDungeon,
    travel,
    monsterFight,
    bossFight,
  };
}

export default DungeonServiceFactory;
