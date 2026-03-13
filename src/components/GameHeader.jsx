/**
 * Shared header: Guide (left), logo + resources (center), Upgrades (right).
 * E2E expects #panelList, #infobutton, #upgradeList; #resources, #gatherButton, #errorDialog in ResourcesBar.
 */
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';
import ResourcesBar from './ResourcesBar.jsx';

export default function GameHeader() {
  const game = useGame();
  const state = useSelector(selectFullState);

  const panel = state.panel || [];
  const upgrades = (state.upgrades || []).filter((u) => u.enabled === true);

  return (
    <>
      <div className="hv-header-left">
        <div className="hv-panel hv-header-panel">
          <div className="hv-panel__header">Guide</div>
          <div className="hv-panel__body hv-flex" style={{ flexDirection: 'column' }}>
            <ul id="panelList">
              <li>
                {panel[0]}
                <hr />
              </li>
              {panel.map((line, i) => (i > 0 ? <li key={`panel-${i}-${String(line).slice(0, 40)}`}>{line}</li> : null))}
            </ul>
            <div id="infoButtonDiv" className="hv-mt-2">
              {state.showTutorial && (
                <div id="infobutton" className="hv-tutorial-next" role="button" tabIndex={0} onClick={() => game.nextTutorial?.()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') game.nextTutorial?.(); }}>Next</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="hv-header-center">
        <div className="hv-logo-wrap">
          <img src="images/heroville-logo.png" alt="HeroVille" className="hv-logo" />
        </div>
        <div id="resources-react-root" className="hv-w-100 hv-mt-2 hv-flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
          <ResourcesBar />
        </div>
      </div>
      <div className="hv-header-right">
        <div className="hv-panel hv-header-panel">
          <div className="hv-panel__header">Upgrades</div>
          <div className="hv-panel__body">
            <ul id="upgradeList">
              {upgrades.map((upgrade) => (
                <li key={upgrade.id}>
                  <button type="button" className="hv-upgrade-btn hv-btn-secondary" onClick={() => game.buyUpgrade?.(upgrade.id)}>
                    {upgrade.name} <br />
                    Cost(g): {upgrade.price} <br />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
