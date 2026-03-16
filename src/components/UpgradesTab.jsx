/**
 * Upgrades tab: available (buyable) and purchased upgrades. E2E expects #upgradeList.
 */
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';

export default function UpgradesTab() {
  const game = useGame();
  const state = useSelector(selectFullState);
  const allUpgrades = state.upgrades || [];
  const available = allUpgrades.filter((u) => u.enabled === true);
  const purchased = allUpgrades.filter((u) => u.purchased === true);

  return (
    <section data-testid="upgrades-tab" className="hv-content">
      <div className="hv-upgrades-intro">
        <h2 className="hv-content-title">Upgrades</h2>
        <p className="hv-content-desc">Spend gold to unlock permanent bonuses.</p>
      </div>

      <div className="hv-upgrades-section">
        <h3 className="hv-upgrades-section__title">Available</h3>
        <ul id="upgradeList" data-testid="upgrade-list" className="hv-upgrades-list">
          {available.length === 0 ? (
            <li className="hv-upgrades-empty">No upgrades available to purchase.</li>
          ) : (
            available.map((upgrade) => (
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
            ))
          )}
        </ul>
      </div>

      {purchased.length > 0 && (
        <div className="hv-upgrades-section">
          <h3 className="hv-upgrades-section__title">Purchased</h3>
          <ul className="hv-upgrades-list hv-upgrades-list--purchased">
            {purchased.map((upgrade) => (
              <li key={upgrade.id} className="hv-upgrade-card hv-upgrade-card--purchased">
                <span className="hv-upgrade-card__name">{upgrade.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
