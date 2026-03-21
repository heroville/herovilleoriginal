/**
 * Bestiary tab: Monsters and Bosses tables. E2E expects "Monsters", "Bosses".
 */
import { useSelector } from 'react-redux';
import { selectFullState } from '../store/index.js';

function orderBy(list, key, reverse = false) {
  if (!key || !Array.isArray(list)) return list;
  const sorted = [...list].sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (va === vb) return 0;
    return va < vb ? -1 : 1;
  });
  return reverse ? sorted.reverse() : sorted;
}

export default function BestiaryTab() {
  const state = useSelector(selectFullState);

  const sorting = state.sorting || {};
  const monKey = sorting.monList || 'value';
  const bossKey = sorting.bossList || 'value';
  const monsters = orderBy(state.monsters || [], monKey);
  const bosses = orderBy(state.bosses || [], bossKey);
  const dungeons = state.dungeons || [];

  const getDungeonNamesForBoss = (bossId) => {
    return dungeons.filter((d) => d.bossID === bossId).map((d) => d.name);
  };

  return (
    <section data-testid="bestiary-tab" className="hv-content">
      <div className="hv-grid hv-grid--2">
        <div className="hv-panel hv-table-card">
          <div className="hv-panel__body hv-panel__body--no-pad">
            <table className="hv-table">
              <thead>
                <tr>
                  <th colSpan={4} className="hv-text-center">
                    Monsters
                  </th>
                </tr>
                <tr>
                  <th>Name</th>
                  <th>Level</th>
                  <th>Damage</th>
                  <th>Health</th>
                </tr>
              </thead>
              <tbody>
                {monsters.map((monster) => (
                  <tr key={monster.id ?? monster.name}>
                    <td>{monster.name}</td>
                    <td>{monster.value}</td>
                    <td>
                      {monster.minDamage}-{monster.maxDamage}
                    </td>
                    <td>{monster.health}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="hv-panel hv-table-card">
          <div className="hv-panel__body hv-panel__body--no-pad">
            <table className="hv-table">
              <thead>
                <tr>
                  <th colSpan={4} className="hv-text-center">
                    Bosses
                  </th>
                </tr>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Damage</th>
                  <th>Health</th>
                </tr>
              </thead>
              <tbody>
                {bosses.map((boss) => (
                  <tr key={boss.id ?? boss.name}>
                    <td>{boss.name}</td>
                    <td>
                      {getDungeonNamesForBoss(boss.id).map((name) => (
                        <div key={name}>{name}</div>
                      ))}
                    </td>
                    <td>
                      {boss.minDamage}-{boss.maxDamage}
                    </td>
                    <td>{boss.health}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
