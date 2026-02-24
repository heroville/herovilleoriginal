/**
 * Dungeon, monster, boss creation, and journey flow (attemptDungeon, travel, monsterFight, bossFight).
 * Used by MainController; receives scope for state and callbacks.
 */

function DungeonServiceFactory($timeout) {
    function dungeonName(scope) {
        if (!scope.dungeonNames || !scope.dungeonNames.dungeons) return 'Dungeon';
        const dList = scope.dungeonNames.dungeons.slice();
        for (let i = 0; i < scope.dungeons.length; i++) {
            for (let j = 0; j < dList.length; j++) {
                if (dList[j] === scope.dungeons[i].name) {
                    if (typeof scope.debugLog === 'function') scope.debugLog('Removed ' + dList[j]);
                    dList.splice(j, 1);
                }
            }
        }
        if (dList.length === 0) return 'Dungeon';
        const random = Math.floor(Math.random() * dList.length);
        return dList[random];
    }

    function createMonster(scope, level) {
        if (!scope.monsterList || !scope.monsterList.monsters) return;
        const monsterList = scope.monsterList.monsters;
        for (let i = 0; i < scope.monsters.length; i++) {
            for (let j = 0; j < monsterList.length; j++) {
                if (monsterList[j].name === scope.monsters[i].name) {
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
            scope.monsters[scope.monsters.length] = {
                id: scope.monsters.length,
                name: monsterList[random].name,
                value: level,
                minDamage: randomMin,
                maxDamage: randomMax,
                health: mobHealth,
                low: 'Junk;j;' + (level * 3),
                high: 'Gold;g;' + level
            };
            if (typeof scope.debugLog === 'function') scope.debugLog('Created ' + scope.monsters[scope.monsters.length - 1].name);
            monsterList.splice(random, 1);
        }
    }

    function createBoss(scope, level) {
        if (!scope.monsterList || !scope.monsterList.monsters) return;
        level += 2;
        const monsterList = scope.monsterList.monsters;
        for (let i = 0; i < scope.bosses.length; i++) {
            for (let j = 0; j < monsterList.length; j++) {
                if (monsterList[j].name === scope.bosses[i].name) {
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
        scope.bosses[scope.bosses.length] = {
            id: scope.bosses.length,
            name: monsterList[random].name,
            value: level,
            minDamage: randomMin,
            maxDamage: randomMax,
            health: mobHealth,
            low: 'Junk;j;' + (level * 3),
            high: 'Gold;g;' + level
        };
        if (typeof scope.debugLog === 'function') scope.debugLog('Created ' + scope.bosses[scope.bosses.length - 1].name);
        monsterList.splice(random, 1);
    }

    function activateDungeon(scope) {
        scope.dungeons[scope.dungeons.length] = {
            id: scope.dungeons.length,
            name: dungeonName(scope),
            level: scope.dungeons.length + 1,
            steps: 15 * (scope.dungeons.length + 1),
            encounterRate: 15 + Math.floor(Math.random() * 6),
            encounterLevel: scope.dungeons.length + 2,
            bossID: scope.dungeons.length,
            enabled: true,
            reward: 'Gold;g;' + (scope.dungeons.length + 1)
        };
        createMonster(scope, scope.dungeons.length);
        createBoss(scope, scope.dungeons.length - 1);
    }

    function attemptDungeon(scope, dungeonID, hero) {
        const dungeon = scope.dungeons[dungeonID];
        const journey = { hero, dungeon, steps: 0 };
        $timeout(function () { travel(scope, journey); }, scope.gameLoop);
    }

    function travel(scope, journey) {
        if (typeof scope.debugLog === 'function') scope.debugLog('steps:' + journey.steps);
        if (journey.steps === journey.dungeon.steps) {
            for (let i = 0; i < journey.hero.length; i++) {
                journey.hero[i].progress = 'Fighting Boss!';
            }
            bossFight(scope, journey);
        } else {
            const roll = Math.floor((Math.random() * 100) + 1);
            if (roll < journey.dungeon.encounterRate) {
                if (typeof scope.debugLog === 'function') scope.debugLog('Encounter Forming');
                monsterFight(scope, journey);
                for (let i = 0; i < journey.hero.length; i++) {
                    journey.hero[i].progress = 'Fighting Encounter!';
                }
            } else {
                journey.steps++;
                for (let i = 0; i < journey.hero.length; i++) {
                    journey.hero[i].progress = Math.round((journey.steps / journey.dungeon.steps) * 100) + '%' + ' Complete';
                }
                $timeout(function () { travel(scope, journey); }, scope.gameLoop);
            }
        }
    }

    function monsterFight(scope, journey) {
        const eLevel = journey.dungeon.encounterLevel;
        const validMonsters = [];
        const encounterMonsters = [];
        let monsterCount = 0;
        let currLevel = 0;
        const copyMonsters = scope.monsters.slice();
        if (typeof scope.debugLog === 'function') scope.debugLog('Encounter Level= ' + eLevel);
        for (let i = 0; i < copyMonsters.length; i++) {
            if (copyMonsters[i].value >= Math.floor(eLevel / 4) && copyMonsters[i].value <= eLevel) {
                validMonsters.push(copyMonsters[i]);
            }
        }
        while (monsterCount < 4 && currLevel < eLevel && (eLevel - currLevel) >= Math.floor(eLevel / 4)) {
            const reducedMonster = [];
            for (let i = 0; i < validMonsters.length; i++) {
                if (validMonsters[i].value <= (eLevel - currLevel)) {
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
                high: 'Gold;g;' + parseInt(reducedMonster[currentMonster].value * multi)
            });
            monsterCount++;
            currLevel += reducedMonster[currentMonster].value;
        }
        scope.startFight(encounterMonsters, journey, false);
    }

    function bossFight(scope, journey) {
        const bossID = journey.dungeon.bossID;
        const multi = journey.hero.length > 1 ? 10 : 1;
        const bossBattle = [{
            name: scope.bosses[bossID].name,
            value: scope.bosses[bossID].value * multi,
            minDamage: scope.bosses[bossID].minDamage * multi,
            maxDamage: scope.bosses[bossID].maxDamage * multi,
            health: scope.bosses[bossID].health * multi,
            maxHealth: scope.bosses[bossID].health * multi,
            high: 'Junk;j;' + parseInt(scope.bosses[bossID].value * multi * 3),
            low: 'Gold;g;' + parseInt(scope.bosses[bossID].value * multi)
        }];
        scope.startFight(bossBattle.slice(), journey, true);
    }

    return {
        activateDungeon,
        createMonster,
        createBoss,
        dungeonName,
        attemptDungeon,
        travel,
        monsterFight,
        bossFight
    };
}

export default DungeonServiceFactory;
