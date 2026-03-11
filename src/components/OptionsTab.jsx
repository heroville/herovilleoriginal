/**
 * Options/Help tab: Save, Load, Reset, theme, Hero options, Skip Tutorial; Quick Guide (tips + game stats).
 * E2E expects #optionTab, #save, #load, #tips, and text "Total Battles:", "Wins:", "Losses:".
 */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';

const QUICK_GUIDE_TIPS = [
  'Upgrade the Tent to attract new Heroes.',
  'Hero will adventure and earn gold and resources from defeating monsters.',
  'Gold will be used by the hero to purchase items from your town. That gold will then be transfered to the towns gold.',
  'A Heroes level will increase their effectiveness while working.'
];

export default function OptionsTab() {
  const game = useGame();
  const state = useSelector(selectFullState);
  const [heroOptionsOpen, setHeroOptionsOpen] = useState(true);

  const handleSave = () => {
    const heroTable = !!(state?.showHeroTable?.enabled);
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
    <>
      <div className="col-lg-6" id="optionTab">
        <h3>Options</h3>
        <button type="button" id="save" onClick={handleSave}>Save</button>
        <button type="button" id="load" onClick={handleLoad}>Load</button>
        <button type="button" id="reset" onClick={() => game?.options?.reset?.()}>Reset</button>
        <button type="button" id="swap theme" value="SwapTheme" onClick={() => game?.options?.changeTheme?.()}>Swap Theme</button>
        <div id="optionMenu">
          <div className="panel panel-default">
            <div
              className="panel-heading noTextSelect"
              style={{ cursor: 'pointer' }}
              onClick={() => setHeroOptionsOpen(!heroOptionsOpen)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setHeroOptionsOpen(!heroOptionsOpen); }}
            >
              Hero Options
            </div>
            {heroOptionsOpen && (
              <div className="panel-body">
                <div>Format Heroes as Table <input type="checkbox" id="showOld" name="showHeroTable" checked={!!state.showHeroTable?.enabled} onChange={handleShowHeroTableChange} /></div>
                <div>Successes before moving up dungeon <select id="successCountSelect" value={state.successCount?.amount} onChange={handleSuccessCountChange}>{optionsSuccess.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                <div>Dungeons moved down on loss <select id="lossCountSelect" value={state.lossCount?.amount} onChange={handleLossCountChange}>{optionsLoss.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>
              </div>
            )}
          </div>
        </div>
        <button type="button" id="skip" onClick={() => game?.options?.skipTut?.()}>Skip Tutorial</button>
      </div>
      <div className="col-lg-6">
        <h3>Quick Guide</h3>
        <div id="tips">
          <ul>
            {QUICK_GUIDE_TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <ul>
            <li>Total Battles: {totalBattles}</li>
            <li>Wins: {wins}</li>
            <li>Losses: {losses}</li>
            <li>Production (Manual)
              <ul>
                {weaponsManual.map((count, idx) => (idx > 0 && weapons[idx] ? <li key={weapons[idx].id ?? weapons[idx].name ?? `manual-${idx}`}>{weapons[idx].name} - {count}</li> : null)).filter(Boolean)}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
