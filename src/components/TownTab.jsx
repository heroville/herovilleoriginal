/**
 * Town tab: buildings and dungeons as two panels. E2E expects "Buildings", "Dungeons".
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
    <section data-testid="town-tab" className="hv-content">
      <div className="hv-stack">
        <div className="hv-panel hv-table-card">
          <div className="hv-panel__body hv-panel__body--no-pad">
            <table className="hv-table">
              <thead>
                <tr>
                  <th colSpan={4} className="hv-text-center">Buildings</th>
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
        {dungeons.length > 0 && (
        <div className="hv-panel hv-table-card">
          <div className="hv-panel__body hv-panel__body--no-pad">
            <table className="hv-table">
              <thead>
                <tr>
                  <th colSpan={5} className="hv-text-center">Dungeons</th>
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
        )}
      </div>
    </section>
  );
}
