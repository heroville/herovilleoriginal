/**
 * Upgrades tab: list of buyable upgrades. E2E expects #upgradeList.
 */
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';

export default function UpgradesTab() {
  const game = useGame();
  const state = useSelector(selectFullState);
  const upgrades = (state.upgrades || []).filter((u) => u.enabled === true);

  return (
    <section data-testid="upgrades-tab" className="hv-content">
      <div className="hv-upgrades-intro">
        <h2 className="hv-content-title">Upgrades</h2>
        <p className="hv-content-desc">Spend gold to unlock permanent bonuses.</p>
      </div>
      <ul id="upgradeList" className="hv-upgrades-list">
        {upgrades.map((upgrade) => (
          <li key={upgrade.id}>
            <button
              type="button"
              className="hv-upgrade-card"
              onClick={() => game.buyUpgrade?.(upgrade.id)}
            >
              <span className="hv-upgrade-card__name">{upgrade.name}</span>
              <span className="hv-upgrade-card__cost">Cost: {upgrade.price}g</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
