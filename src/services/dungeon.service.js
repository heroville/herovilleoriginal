/**
 * Dungeon, monster, and boss creation. Used by MainController; receives scope for state and callbacks.
 */

function DungeonServiceFactory() {
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

    return {
        activateDungeon,
        createMonster,
        createBoss,
        dungeonName
    };
}

export default DungeonServiceFactory;
