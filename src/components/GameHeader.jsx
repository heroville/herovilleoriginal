/**
 * Shared header: tutorial panel, logo, upgrades list.
 * E2E expects #panelList, #infobutton, #upgradeList.
 */
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';

export default function GameHeader() {
  const game = useGame();
  const state = useSelector(selectFullState);

  const panel = state.panel || [];
  const upgrades = (state.upgrades || []).filter((u) => u.enabled === true);

  return (
    <>
      <div className="col-lg-4">
        <div className="panel panel-default">
          <div className="panel-body">
            <ul id="panelList">
              <li>
                <b>{panel[0]}</b>
                <hr />
              </li>
              {panel.map((line, i) => (i > 0 ? <li key={`panel-${i}-${String(line).slice(0, 40)}`}>{line}</li> : null))}
            </ul>
            <br />
            <div id="infoButtonDiv">
              {state.showTutorial && (
                <div id="infobutton" role="button" tabIndex={0} onClick={() => game.nextTutorial?.()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') game.nextTutorial?.(); }}>Next</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        <img src="images/heroville-logo.png" width="100%" alt="HeroVille" />
      </div>
      <div className="col-lg-4">
        <div className="panel panel-default">
          <div className="panel-heading">Upgrades</div>
          <div className="panel-body">
            <ul id="upgradeList">
              {upgrades.map((upgrade) => (
                <li key={upgrade.id}>
                  <button type="button" onClick={() => game.buyUpgrade?.(upgrade.id)}>
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
