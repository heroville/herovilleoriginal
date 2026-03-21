/**
 * Options/Help tab: Save, Load, Reset, Hero options, Skip Tutorial; Quick Guide; Support links.
 * E2E expects #optionTab, #save, #load, #tips, and text "Total Battles:", "Wins:", "Losses:".
 */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';

function sendGa(category, label) {
  if (typeof window !== 'undefined' && typeof window.ga === 'function') {
    window.ga('send', 'event', 'Clicks', category, label);
  }
}

const QUICK_GUIDE_TIPS = [
  'Upgrade the Tent to attract new Heroes.',
  'Hero will adventure and earn gold and resources from defeating monsters.',
  'Gold will be used by the hero to purchase items from your town. That gold will then be transfered to the towns gold.',
  'A Heroes level will increase their effectiveness while working.',
];

export default function OptionsTab() {
  const game = useGame();
  const state = useSelector(selectFullState);
  const [heroOptionsOpen, setHeroOptionsOpen] = useState(true);

  const handleSave = () => {
    const heroTable = !!state?.showHeroTable?.enabled;
    game.options?.save?.({ heroTable });
  };

  const handleLoad = () => {
    game.options?.load?.();
  };

  const handleShowHeroTableChange = (e) => {
    game.setHeroTableEnabled?.(e.target.checked);
  };

  const handleSuccessCountChange = (e) => {
    game.setSuccessCount?.(e.target.value);
  };

  const handleLossCountChange = (e) => {
    game.setLossCount?.(e.target.value);
  };

  const gameStats = state.gameStats || {};
  const wins = gameStats.wins ?? 0;
  const losses = gameStats.losses ?? 0;
  const totalBattles = wins + losses;
  const weaponsManual = gameStats.weaponsManual || [];
  const weapons = state.weapons || [];
  const optionsSuccess = state.optionsSuccess || [];
  const optionsLoss = state.optionsLoss || [];

  return (
    <div className="hv-options-layout" id="optionTab" data-testid="options-panel">
      <div className="hv-options-panel">
        <div className="hv-options-panel-header">Settings</div>
        <div className="hv-options-panel-body">
          <div className="hv-options-actions">
            <button
              type="button"
              id="save"
              data-testid="save-button"
              className="hv-btn-secondary"
              onClick={handleSave}
            >
              Save
            </button>
            <button type="button" id="load" className="hv-btn-secondary" onClick={handleLoad}>
              Load
            </button>
            <button
              type="button"
              id="reset"
              className="hv-btn-secondary"
              onClick={() => game?.options?.reset?.()}
            >
              Reset
            </button>
          </div>
          <div id="optionMenu">
            <div
              className="hv-options-panel-header noTextSelect"
              style={{ cursor: 'pointer', margin: '0 -1rem', padding: '0.6rem 1rem' }}
              onClick={() => setHeroOptionsOpen(!heroOptionsOpen)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setHeroOptionsOpen(!heroOptionsOpen);
              }}
            >
              Hero Options {heroOptionsOpen ? '▼' : '▶'}
            </div>
            {heroOptionsOpen && (
              <div style={{ paddingTop: '0.75rem' }}>
                <div className="hv-options-form-group">
                  <label>
                    <input
                      type="checkbox"
                      id="showOld"
                      name="showHeroTable"
                      checked={!!state.showHeroTable?.enabled}
                      onChange={handleShowHeroTableChange}
                    />
                    Format Heroes as Table
                  </label>
                </div>
                <div className="hv-options-form-group">
                  <label htmlFor="successCountSelect">Successes before moving up dungeon</label>
                  <select
                    id="successCountSelect"
                    value={state.successCount?.amount}
                    onChange={handleSuccessCountChange}
                  >
                    {optionsSuccess.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="hv-options-form-group">
                  <label htmlFor="lossCountSelect">Dungeons moved down on loss</label>
                  <select
                    id="lossCountSelect"
                    value={state.lossCount?.amount}
                    onChange={handleLossCountChange}
                  >
                    {optionsLoss.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button
              type="button"
              id="skip"
              className="hv-btn-secondary"
              onClick={() => game?.options?.skipTut?.()}
            >
              Skip Tutorial
            </button>
          </div>
        </div>
      </div>
      <div className="hv-options-panel">
        <div className="hv-options-panel-header">Quick Guide</div>
        <div className="hv-options-panel-body">
          <ul className="hv-guide-tips" id="tips">
            {QUICK_GUIDE_TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <ul className="hv-guide-stats">
            <li>
              <span>Total Battles:</span> <span className="hv-stat-value">{totalBattles}</span>
            </li>
            <li>
              <span>Wins:</span> <span className="hv-stat-value">{wins}</span>
            </li>
            <li>
              <span>Losses:</span> <span className="hv-stat-value">{losses}</span>
            </li>
            <li>
              <span>Production (Manual)</span>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0.25rem 0 0' }}>
                {weaponsManual
                  .map((count, idx) =>
                    idx > 0 && weapons[idx] ? (
                      <li key={weapons[idx].id ?? weapons[idx].name ?? `manual-${idx}`}>
                        {weapons[idx].name} – {count}
                      </li>
                    ) : null
                  )
                  .filter(Boolean)}
              </ul>
            </li>
          </ul>
          <div className="hv-options-support">
            <div
              className="hv-options-panel-header"
              style={{ marginTop: '1rem', marginBottom: '0.5rem' }}
            >
              Support
            </div>
            <div className="hv-support-links">
              <a
                id="paypal"
                href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=KWC55P8UFP3AN"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sendGa('Paypal')}
                title="Donate via PayPal"
                aria-label="Donate via PayPal"
              >
                <img src="images/paypal.png" style={{ width: 32, height: 32 }} alt="" aria-hidden />
              </a>
              <a
                id="reddit"
                href="http://www.reddit.com/r/heroville/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sendGa('Reddit')}
                title="Reddit r/heroville"
                aria-label="Reddit community"
              >
                <img src="images/reddit.png" style={{ width: 32, height: 32 }} alt="" aria-hidden />
              </a>
              <a
                id="patreon"
                href="http://www.patreon.com/meredori"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sendGa('Patreon')}
                title="Support on Patreon"
                aria-label="Support on Patreon"
              >
                <img
                  src="images/patreon.png"
                  style={{ width: 32, height: 32 }}
                  alt=""
                  aria-hidden
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
