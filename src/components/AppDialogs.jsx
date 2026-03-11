/**
 * React modals: New Hero, New Worker, Version, Confirm, Loading.
 * E2E: hero dialog has #name and .heroPopup Accept; worker has #name2 and .workerPopup Accept.
 */
import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext.jsx';

const BACKDROP_STYLE = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const MODAL_STYLE = {
  backgroundColor: 'white',
  padding: 20,
  borderRadius: 8,
  minWidth: 320,
  maxWidth: '90%',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
};

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
        <div style={BACKDROP_STYLE} onClick={() => close('hero')} role="presentation">
          <div className="heroPopup" style={MODAL_STYLE} onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="hero-dialog-title">
            <h3 id="hero-dialog-title">New Hero</h3>
            <div id="error">{heroError && <span style={{ color: 'red' }}>{heroError}</span>}</div>
            <p>Enter a name for the hero.</p>
            <input type="text" id="name" name="name" value={heroName} onChange={(e) => setHeroName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleHeroAccept()} />
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={handleHeroAccept}>Accept</button>
            </div>
          </div>
        </div>
      )}

      {dialogState.worker && (
        <div style={BACKDROP_STYLE} onClick={() => close('worker')} role="presentation">
          <div className="workerPopup" style={MODAL_STYLE} onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="worker-dialog-title">
            <h3 id="worker-dialog-title">New Worker</h3>
            <div>{workerError && <span style={{ color: 'red' }}>{workerError}</span>}</div>
            <p>Enter a name for the worker.</p>
            <input type="text" id="name2" name="name2" value={workerName} onChange={(e) => setWorkerName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleWorkerAccept()} />
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={handleWorkerAccept}>Accept</button>
            </div>
          </div>
        </div>
      )}

      {dialogState.version && (
        <div style={BACKDROP_STYLE} onClick={() => close('version')} role="presentation">
          <div style={MODAL_STYLE} onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="version-dialog-title">
            <h3 id="version-dialog-title">Version Information</h3>
            <p>Current Version: 1.3.2 - 2 Oct 2017</p>
            <ul>
              <li>Fix issue with new potions not giving gold</li>
              <li>Added Dark Theme</li>
            </ul>
            <button type="button" onClick={() => close('version')}>Close</button>
          </div>
        </div>
      )}

      {dialogState.confirm && (
        <div style={BACKDROP_STYLE} onClick={() => close('confirm')} role="presentation">
          <div style={MODAL_STYLE} onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="confirm-dialog-title">
            <h3 id="confirm-dialog-title">Confirmation Required</h3>
            <p>This change is permanent, are you sure this is what you want to do?</p>
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={handleConfirmConfirm}>Confirm</button>
              <button type="button" onClick={() => close('confirm')}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {dialogState.loading && (
        <div style={BACKDROP_STYLE} onClick={() => close('loading')} role="presentation">
          <div style={MODAL_STYLE} onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="loading-dialog-title">
            <h3 id="loading-dialog-title">Old Version</h3>
            <p>You are loading from an old version, there may be errors. If the game does not load correctly try starting a new game by refreshing the page and canceling this dialog. Do you want to load the old save?</p>
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={handleLoadingAccept}>Accept</button>
              <button type="button" onClick={() => close('loading')}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
