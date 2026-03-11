/**
 * React modals: New Hero, New Worker, Version, Confirm, Loading.
 * E2E: hero dialog has #name and .heroPopup Accept; worker has #name2 and .workerPopup Accept.
 */
import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext.jsx';

/** Backdrop and dialog use CSS classes so modals respect dark theme (--hv-bg, --hv-text, --hv-border). */

export default function AppDialogs() {
  const game = useGame();
  const [dialogState, setDialogState] = useState(() => game?.getDialogState?.() ?? {});
  const [heroName, setHeroName] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [heroError, setHeroError] = useState('');
  const [workerError, setWorkerError] = useState('');

  useEffect(() => {
    return game?.registerDialogListener?.(setDialogState) ?? (() => {});
  }, [game]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (dialogState.hero) close('hero');
      else if (dialogState.worker) close('worker');
      else if (dialogState.version) close('version');
      else if (dialogState.confirm) close('confirm');
      else if (dialogState.loading) close('loading');
    };
    if (dialogState.hero || dialogState.worker || dialogState.version || dialogState.confirm || dialogState.loading) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [dialogState.hero, dialogState.worker, dialogState.version, dialogState.confirm, dialogState.loading]);

  useEffect(() => {
    if (dialogState.hero) {
      setHeroName(game?.newHeroName?.() ?? '');
      setHeroError('');
    }
  }, [dialogState.hero, game]);

  useEffect(() => {
    if (dialogState.worker) {
      setWorkerName(game?.newHeroName?.() ?? '');
      setWorkerError('');
    }
  }, [dialogState.worker, game]);

  const close = (type) => game?.setDialogState?.(type, false);

  const handleHeroAccept = () => {
    const name = heroName?.trim() ?? '';
    if (!name) {
      setHeroError('You must enter a valid name for the hero.');
      return;
    }
    const state = game?.getState?.();
    const exists = (state?.heroList ?? []).some((h) => h.name === name);
    if (exists) {
      setHeroError('A hero with this name already exists.');
      return;
    }
    game?.addHero?.(name);
    close('hero');
  };

  const handleWorkerAccept = () => {
    const name = workerName?.trim() ?? '';
    if (!name) {
      setWorkerError('You must enter a valid name for the worker.');
      return;
    }
    const state = game?.getState?.();
    const exists = (state?.heroList ?? []).some((h) => h.name === name);
    if (exists) {
      setWorkerError('A worker with this name already exists.');
      return;
    }
    game?.addWorker?.(name);
    close('worker');
  };

  const handleConfirmConfirm = () => {
    game?.confirmClass?.();
    close('confirm');
  };

  const handleLoadingAccept = () => {
    game?.loadData?.();
    close('loading');
  };

  if (!dialogState.hero && !dialogState.worker && !dialogState.version && !dialogState.confirm && !dialogState.loading) {
    return null;
  }

  return (
    <>
      {dialogState.hero && (
        <div className="hv-modal-backdrop" onClick={() => close('hero')} role="presentation">
          <div className="heroPopup hv-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="hero-dialog-title">
            <h3 id="hero-dialog-title">New Hero</h3>
            <div id="error">{heroError && <span className="text-danger">{heroError}</span>}</div>
            <p>Enter a name for the hero.</p>
            <input type="text" id="name" name="name" value={heroName} onChange={(e) => setHeroName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleHeroAccept()} className="w-100" />
            <div style={{ marginTop: 12 }}>
              <button type="button" className="hv-btn-primary hv-btn-auto" onClick={handleHeroAccept}>Accept</button>
            </div>
          </div>
        </div>
      )}

      {dialogState.worker && (
        <div className="hv-modal-backdrop" onClick={() => close('worker')} role="presentation">
          <div className="workerPopup hv-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="worker-dialog-title">
            <h3 id="worker-dialog-title">New Worker</h3>
            <div>{workerError && <span className="text-danger">{workerError}</span>}</div>
            <p>Enter a name for the worker.</p>
            <input type="text" id="name2" name="name2" value={workerName} onChange={(e) => setWorkerName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleWorkerAccept()} className="w-100" />
            <div style={{ marginTop: 12 }}>
              <button type="button" className="hv-btn-primary hv-btn-auto" onClick={handleWorkerAccept}>Accept</button>
            </div>
          </div>
        </div>
      )}

      {dialogState.version && (
        <div className="hv-modal-backdrop" onClick={() => close('version')} role="presentation">
          <div className="hv-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="version-dialog-title">
            <h3 id="version-dialog-title">Version Information</h3>
            <p>Current Version: 1.3.2 - 2 Oct 2017</p>
            <ul>
              <li>Fix issue with new potions not giving gold</li>
              <li>Added Dark Theme</li>
            </ul>
            <button type="button" className="hv-btn-auto" onClick={() => close('version')}>Close</button>
          </div>
        </div>
      )}

      {dialogState.confirm && (
        <div className="hv-modal-backdrop" onClick={() => close('confirm')} role="presentation">
          <div className="hv-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="confirm-dialog-title">
            <h3 id="confirm-dialog-title">Confirmation Required</h3>
            <p>This change is permanent, are you sure this is what you want to do?</p>
            <div style={{ marginTop: 12 }}>
              <button type="button" className="hv-btn-primary hv-btn-auto" onClick={handleConfirmConfirm}>Confirm</button>
              <button type="button" className="hv-btn-auto" onClick={() => close('confirm')}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {dialogState.loading && (
        <div className="hv-modal-backdrop" onClick={() => close('loading')} role="presentation">
          <div className="hv-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="loading-dialog-title">
            <h3 id="loading-dialog-title">Old Version</h3>
            <p>You are loading from an old version, there may be errors. If the game does not load correctly try starting a new game by refreshing the page and canceling this dialog. Do you want to load the old save?</p>
            <div style={{ marginTop: 12 }}>
              <button type="button" className="hv-btn-primary hv-btn-auto" onClick={handleLoadingAccept}>Accept</button>
              <button type="button" className="hv-btn-auto" onClick={() => close('loading')}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
