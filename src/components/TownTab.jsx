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
    <section data-testid="town-tab" className="row justify-content-center">
      <div className="col-lg-6 mb-3">
        <div className="card h-100">
          <div className="card-body p-2">
            <table className="table table-bordered mb-0">
              <thead>
                <tr>
                  <th colSpan={4} className="text-center">Buildings</th>
                </tr>
                <tr>
                  <th>Name</th>
                  <th>Level</th>
                  <th>Cost</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((building) => (
                  <tr key={building.id}>
                    <td title={building.description}>{building.name}</td>
                    <td>{typeof building.count === 'number' ? building.count.toLocaleString() : building.count}</td>
                    <td>{typeof building.cost === 'number' ? building.cost.toLocaleString() : building.cost}</td>
                    <td>
                      <button
                        type="button"
                        className="hv-btn-primary hv-btn-auto"
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
        </div>
      </div>
      <div className="col-lg-6 mb-3" style={dungeons.length === 0 ? { display: 'none' } : undefined}>
        <div className="card h-100">
          <div className="card-body p-2">
            <table className="table table-bordered mb-0">
              <thead>
                <tr>
                  <th colSpan={5} className="text-center">Dungeons</th>
                </tr>
                <tr>
                  <th>Name</th>
                  <th>Level</th>
                  <th>Boss</th>
                  <th>Length</th>
                  <th>Encounter Rate</th>
                </tr>
              </thead>
              <tbody>
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
        </div>
      </div>
    </section>
  );
}
