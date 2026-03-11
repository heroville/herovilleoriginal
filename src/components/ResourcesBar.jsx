/**
 * Shared resources row: resources/gold display, buff icons, Gather button.
 * E2E expects #resources, #gatherButton, #errorDialog.
 */
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';

export default function ResourcesBar() {
  const game = useGame();
  const state = useSelector(selectFullState);
  const [errorMessage, setErrorMessage] = useState('');
  const clearErrorRef = useRef(null);
  useEffect(() => {
    if (!game?.registerErrorListener) return () => {};
    const unsub = game.registerErrorListener((msg) => {
      if (clearErrorRef.current) clearTimeout(clearErrorRef.current);
      setErrorMessage(msg);
      clearErrorRef.current = setTimeout(() => {
        setErrorMessage('');
        clearErrorRef.current = null;
      }, 3000);
    });
    return () => {
      if (clearErrorRef.current) clearTimeout(clearErrorRef.current);
      unsub?.();
    };
  }, [game]);

  const resources = state.resources ?? 0;
  const maxResources = state.maxResources ?? 0;
  const gold = state.gold ?? 0;
  const maxGold = state.maxGold ?? 0;
  const incr = state.incr ?? 1;
  const gameLoop = state.gameLoop ?? 1000;
  const damageMulti = state.damageMulti ?? 1;
  const goldMulti = state.goldMulti ?? 1;

  const isSuccessMessage = /saved|save/i.test(errorMessage || '');
  return (
    <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
        <div id="resources" className="d-flex align-items-center gap-2 flex-wrap">
          <span title="Resources (materials)">
            {resources.toLocaleString()}/{maxResources.toLocaleString()}
            <img src="images/I_Chest01.png" alt="" aria-hidden />
          </span>
          <span title="Gold">
            {gold.toLocaleString()}/{maxGold.toLocaleString()}
            <img src="images/I_GoldBar.png" alt="" aria-hidden />
          </span>
          {gameLoop !== 1000 && <img src="images/S_Buff11.png" alt="" title="Doubles the game speed" />}
          {damageMulti !== 1 && <img src="images/S_Shadow07.png" alt="" title="Doubles your heroes damage" />}
          {goldMulti !== 1 && <img src="images/E_Gold02.png" alt="" title="Doubles the gold gained from sales" />}
        </div>
        <div id="gatherButton" className="hv-btn-primary" role="button" tabIndex={0} onClick={() => game.incrRes?.(state?.incr ?? 1)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') game.incrRes?.(state?.incr ?? 1); }}>Gather</div>
        <div id="errorDialog" className={`hv-message-toast ${isSuccessMessage ? 'hv-message-success' : ''}`} title={errorMessage ? 'Message' : 'Error'} role="alert" aria-live="polite">{errorMessage || '\u00A0'}</div>
    </div>
  );
}
