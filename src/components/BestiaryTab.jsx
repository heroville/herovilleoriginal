/**
 * Bestiary tab: Monsters and Bosses tables (read-only).
 * E2E expects section#container with "Monsters" and "Bosses".
 */
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
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
  const game = useGame();
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
    <section data-testid="bestiary-tab">
      <div className="col-lg-6">
        <table className="table table-bordered">
          <tbody>
            <tr>
              <td><u><b>Monsters</b></u></td>
            </tr>
            <tr>
              <td><b><u>Name</u></b></td>
              <td><b><u>Level</u></b></td>
              <td><b><u>Damage</u></b></td>
              <td><b><u>Health</u></b></td>
            </tr>
            {monsters.map((monster) => (
              <tr key={monster.id ?? monster.name}>
                <td>{monster.name}</td>
                <td>{monster.value}</td>
                <td>{monster.minDamage}-{monster.maxDamage}</td>
                <td>{monster.health}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="col-lg-6">
        <table className="table table-bordered">
          <tbody>
            <tr>
              <td><u><b>Bosses</b></u></td>
            </tr>
            <tr>
              <td><b><u>Name</u></b></td>
              <td><b><u>Location</u></b></td>
              <td><b><u>Damage</u></b></td>
              <td><b><u>Health</u></b></td>
            </tr>
            {bosses.map((boss) => (
              <tr key={boss.id ?? boss.name}>
                <td>{boss.name}</td>
                <td>
                  {getDungeonNamesForBoss(boss.id).map((name) => (
                    <div key={name}>{name}</div>
                  ))}
                </td>
                <td>{boss.minDamage}-{boss.maxDamage}</td>
                <td>{boss.health}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
