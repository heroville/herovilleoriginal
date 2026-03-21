/**
 * Dungeon, monster, boss creation, and journey flow.
 * When store is bound via bindStore(store), dispatches REPLACE_STATE after activateDungeon, travel (progress), and monsterFight.
 */
import { REPLACE_STATE } from '../store/sliceState.js';

function DungeonServiceFactory(GameStateService, $timeout, $injector) {
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

  function dungeonName() {
    const s = GameStateService.getState();
    if (!s.dungeonNames || !s.dungeonNames.dungeons) return 'Dungeon';
    const dList = s.dungeonNames.dungeons.slice();
    for (let i = 0; i < s.dungeons.length; i++) {
      for (let j = 0; j < dList.length; j++) {
        if (dList[j] === s.dungeons[i].name) {
          dList.splice(j, 1);
        }
      }
    }
    if (dList.length === 0) return 'Dungeon';
    const random = Math.floor(Math.random() * dList.length);
    return dList[random];
  }

  function createMonster(level) {
    const s = GameStateService.getState();
    if (!s.monsterList || !s.monsterList.monsters) return;
    const monsterList = s.monsterList.monsters;
    for (let i = 0; i < s.monsters.length; i++) {
      for (let j = 0; j < monsterList.length; j++) {
        if (monsterList[j].name === s.monsters[i].name) {
          monsterList.splice(j, 1);
        }
      }
    }
    for (let i = 0; i < 3; i++) {
      if (monsterList.length === 0) break;
      const random = Math.floor(Math.random() * monsterList.length);
      const randomMax = Math.ceil(Math.random() * (level * level + 1));
      const randomMin = Math.ceil(Math.random() * randomMax);
      const averagedmg = Math.ceil((randomMax + randomMin) / 2);
      const mobHealth = Math.floor(((5 * level) / averagedmg) * (level * level));
      s.monsters[s.monsters.length] = {
        id: s.monsters.length,
        name: monsterList[random].name,
        value: level,
        minDamage: randomMin,
        maxDamage: randomMax,
        health: mobHealth,
        low: 'Junk;j;' + level * 3,
        high: 'Gold;g;' + level,
      };
      monsterList.splice(random, 1);
    }
  }

  function createBoss(level) {
    const s = GameStateService.getState();
    if (!s.monsterList || !s.monsterList.monsters) return;
    level += 2;
    const monsterList = s.monsterList.monsters;
    for (let i = 0; i < s.bosses.length; i++) {
      for (let j = 0; j < monsterList.length; j++) {
        if (monsterList[j].name === s.bosses[i].name) {
          monsterList.splice(j, 1);
        }
      }
    }
    if (monsterList.length === 0) return;
    const random = Math.floor(Math.random() * monsterList.length);
    const randomMax = Math.ceil(Math.random() * (level * level + 1));
    const randomMin = Math.ceil(Math.random() * randomMax);
    const averagedmg = Math.ceil((randomMax + randomMin) / 2);
    const mobHealth = Math.floor(((5 * level) / averagedmg) * (level * level));
    s.bosses[s.bosses.length] = {
      id: s.bosses.length,
      name: monsterList[random].name,
      value: level,
      minDamage: randomMin,
      maxDamage: randomMax,
      health: mobHealth,
      low: 'Junk;j;' + level * 3,
      high: 'Gold;g;' + level,
    };
    monsterList.splice(random, 1);
  }

  function activateDungeon() {
    const s = GameStateService.getState();
    s.dungeons[s.dungeons.length] = {
      id: s.dungeons.length,
      name: dungeonName(),
      level: s.dungeons.length + 1,
      steps: 15 * (s.dungeons.length + 1),
      encounterRate: 15 + Math.floor(Math.random() * 6),
      encounterLevel: s.dungeons.length + 2,
      bossID: s.dungeons.length,
      enabled: true,
      reward: 'Gold;g;' + (s.dungeons.length + 1),
    };
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
      if (copyMonsters[i].value >= Math.floor(eLevel / 4) && copyMonsters[i].value <= eLevel) {
        validMonsters.push(copyMonsters[i]);
      }
    }
    while (monsterCount < 4 && currLevel < eLevel && eLevel - currLevel >= Math.floor(eLevel / 4)) {
      const reducedMonster = [];
      for (let i = 0; i < validMonsters.length; i++) {
        if (validMonsters[i].value <= eLevel - currLevel) {
          reducedMonster.push(validMonsters[i]);
        }
      }
      const currentMonster = Math.floor(Math.random() * reducedMonster.length);
      const multi = journey.hero.length > 1 ? 10 : 1;
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
    const multi = journey.hero.length > 1 ? 10 : 1;
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
