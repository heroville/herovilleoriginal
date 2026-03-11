/**
 * Town tab: buildings list (Improve button), dungeons list.
 * E2E expects section#container with "Buildings" and "Dungeons".
 * Subscribes to Redux store so UI updates immediately when store updates (e.g. after Improve Tavern).
 */
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';

export default function TownTab() {
  const game = useGame();
  const state = useSelector(selectFullState);

  const buildings = (state.buildings || []).filter((b) => b.enabled === true);
  const dungeons = (state.dungeons || []).filter((d) => d.enabled === true);
  const bosses = state.bosses || {};

  return (
    <section id="container" data-testid="town-tab">
      <div className="col-lg-6">
        <table className="table table-bordered">
          <tbody>
            <tr>
              <td><b><u>Buildings</u></b></td>
            </tr>
            <tr>
              <th><u>Name</u></th>
              <th><u>Level</u></th>
              <th><u>Cost</u></th>
            </tr>
            {buildings.map((building) => (
              <tr key={building.id}>
                <td title={building.description}>{building.name}</td>
                <td>{typeof building.count === 'number' ? building.count.toLocaleString() : building.count}</td>
                <td>{typeof building.cost === 'number' ? building.cost.toLocaleString() : building.cost}</td>
                <td>
                  <button
                    type="button"
                    title={building.description}
                    onClick={() => game.town.incrBuilding(building)}
                  >
                    Improve {building.name}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="col-lg-6" style={dungeons.length === 0 ? { display: 'none' } : undefined}>
        <table className="table table-bordered">
          <tbody>
            <tr>
              <td><u><b>Dungeons</b></u></td>
            </tr>
            <tr>
              <td><u>Name</u></td>
              <td><u>Level</u></td>
              <td><u>Boss</u></td>
              <td><u>Length</u></td>
              <td><u>Encounter Rate</u></td>
            </tr>
            {dungeons.map((dungeon) => (
              <tr key={dungeon.id ?? dungeon.name}>
                <td>{dungeon.name}</td>
                <td>{dungeon.level}</td>
                <td>{bosses[dungeon.bossID]?.name ?? '—'}</td>
                <td>{dungeon.steps}</td>
                <td>{dungeon.encounterRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
