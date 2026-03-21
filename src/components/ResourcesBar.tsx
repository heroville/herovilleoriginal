/**
 * Resources row: clickable resources (count + icon) triggers gather; gold + buffs display only.
 * E2E expects #resources, #gatherButton (on the clickable area), #errorDialog.
 */
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.tsx';
import { selectFullState } from '../store/index.ts';

export default function ResourcesBar() {
  const game = useGame();
  const state = useSelector(selectFullState);
  const [errorMessage, setErrorMessage] = useState('');
  const clearErrorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const gameLoop = state.gameLoop ?? 1000;
  const damageMulti = state.damageMulti ?? 1;
  const goldMulti = state.goldMulti ?? 1;

  const isSuccessMessage = /saved|save/i.test(errorMessage || '');
  const goldHint = maxGold === 0 ? ' (Unlock Stockpile for gold)' : '';
  const handleGather = () => game.incrRes?.(state?.incr ?? 1);

  return (
    <div className="hv-resources-bar">
      <div className="hv-resources-label" aria-hidden="true">
        Resources / Gold
      </div>
      <div className="hv-resources-row">
        <div
          id="gatherButton"
          data-testid="gather-trigger"
          role="button"
          tabIndex={0}
          className="hv-resources-gather"
          onClick={handleGather}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleGather();
            }
          }}
          title="Click to gather resources"
          aria-label="Gather resources"
        >
          <span
            id="resources"
            data-testid="resources-count"
            className="hv-resource-item hv-resource-item--clickable"
          >
            <span className="hv-resource-value">
              {resources.toLocaleString()}/{maxResources.toLocaleString()}
            </span>
            <img src="images/I_Chest01.png" alt="" aria-hidden className="hv-resource-icon" />
          </span>
        </div>
        <span
          className="hv-resource-item"
          title={`Gold. Current: ${gold.toLocaleString()}, max: ${maxGold.toLocaleString()}${goldHint}`}
        >
          <span className="hv-resource-value">
            {gold.toLocaleString()}/{maxGold.toLocaleString()}
            {maxGold === 0 ? (
              <span className="hv-gold-hint" title="Build Stockpile in Town to store gold.">
                {' '}
                (Unlock Stockpile)
              </span>
            ) : null}
          </span>
          <img src="images/I_GoldBar.png" alt="" aria-hidden className="hv-resource-icon" />
        </span>
        {gameLoop !== 1000 && (
          <img
            src="images/S_Buff11.png"
            alt="Speed buff"
            className="hv-buff-icon"
            title="Doubles the game speed"
          />
        )}
        {damageMulti !== 1 && (
          <img
            src="images/S_Shadow07.png"
            alt="Damage buff"
            className="hv-buff-icon"
            title="Doubles your heroes damage"
          />
        )}
        {goldMulti !== 1 && (
          <img
            src="images/E_Gold02.png"
            alt="Gold buff"
            className="hv-buff-icon"
            title="Doubles the gold gained from sales"
          />
        )}
        <div
          id="errorDialog"
          data-testid="error-toast"
          className={`hv-message-toast ${isSuccessMessage ? 'hv-message-success' : ''}`}
          title={errorMessage ? 'Message' : 'Error'}
          role="alert"
          aria-live="polite"
        >
          {errorMessage || '\u00A0'}
        </div>
      </div>
    </div>
  );
}
