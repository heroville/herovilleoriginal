/**
 * React modals: New Hero, New Worker, Version, Confirm, Loading.
 * E2E: hero dialog has #name and .heroPopup Accept; worker has #name2 and .workerPopup Accept.
 * Focus trap: Tab cycles within modal; Escape closes; focus restored on close.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../contexts/GameContext.jsx';

/** Backdrop and dialog use CSS classes so modals respect dark theme (--hv-bg, --hv-text, --hv-border). */

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function useFocusTrap(containerRef, isActive) {
  const previousFocusRef = useRef(null);
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    previousFocusRef.current = document.activeElement;
    const el = containerRef.current;
    const focusable = el.querySelectorAll(FOCUSABLE);
    const first = focusable[0];
    const _last = focusable[focusable.length - 1];
    if (first && typeof first.focus === 'function') first.focus();
    const handleKey = (e) => {
      if (e.key !== 'Tab') return;
      const focusableList = el.querySelectorAll(FOCUSABLE);
      const firstEl = focusableList[0];
      const lastEl = focusableList[focusableList.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstEl && lastEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl && firstEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    el.addEventListener('keydown', handleKey);
    return () => {
      el.removeEventListener('keydown', handleKey);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, containerRef]);
}

export default function AppDialogs() {
  const game = useGame();
  const [dialogState, setDialogState] = useState(() => game?.getDialogState?.() ?? {});
  const [heroName, setHeroName] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [heroError, setHeroError] = useState('');
  const [workerError, setWorkerError] = useState('');
  const heroDialogRef = useRef(null);
  const workerDialogRef = useRef(null);
  const versionDialogRef = useRef(null);
  const confirmDialogRef = useRef(null);
  const loadingDialogRef = useRef(null);

  const close = useCallback((type) => game?.setDialogState?.(type, false), [game]);

  useEffect(() => {
    return game?.registerDialogListener?.(setDialogState) ?? (() => {});
  }, [game]);

  useFocusTrap(heroDialogRef, !!dialogState.hero);
  useFocusTrap(workerDialogRef, !!dialogState.worker);
  useFocusTrap(versionDialogRef, !!dialogState.version);
  useFocusTrap(confirmDialogRef, !!dialogState.confirm);
  useFocusTrap(loadingDialogRef, !!dialogState.loading);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (dialogState.hero) close('hero');
      else if (dialogState.worker) close('worker');
      else if (dialogState.version) close('version');
      else if (dialogState.confirm) close('confirm');
      else if (dialogState.loading) close('loading');
    };
    if (
      dialogState.hero ||
      dialogState.worker ||
      dialogState.version ||
      dialogState.confirm ||
      dialogState.loading
    ) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [
    dialogState.hero,
    dialogState.worker,
    dialogState.version,
    dialogState.confirm,
    dialogState.loading,
    close,
  ]);

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

  if (
    !dialogState.hero &&
    !dialogState.worker &&
    !dialogState.version &&
    !dialogState.confirm &&
    !dialogState.loading
  ) {
    return null;
  }

  return (
    <>
      {dialogState.hero && (
        <div className="hv-modal-backdrop" onClick={() => close('hero')} role="presentation">
          <div
            ref={heroDialogRef}
            className="heroPopup hv-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hero-dialog-title"
            aria-describedby="hero-dialog-desc"
          >
            <div className="hv-modal-header">
              <h3 id="hero-dialog-title">New Hero</h3>
            </div>
            <div className="hv-modal-body">
              <div id="error" role="alert">
                {heroError && <span className="text-danger">{heroError}</span>}
              </div>
              <p id="hero-dialog-desc">Enter a name for the hero.</p>
              <input
                type="text"
                id="name"
                name="name"
                data-testid="hero-name-input"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleHeroAccept()}
                className="hv-w-100"
              />
              <div className="hv-modal-actions">
                <button
                  type="button"
                  className="hv-btn-primary hv-btn-auto"
                  onClick={handleHeroAccept}
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dialogState.worker && (
        <div className="hv-modal-backdrop" onClick={() => close('worker')} role="presentation">
          <div
            ref={workerDialogRef}
            className="workerPopup hv-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="worker-dialog-title"
            aria-describedby="worker-dialog-desc"
          >
            <div className="hv-modal-header">
              <h3 id="worker-dialog-title">New Worker</h3>
            </div>
            <div className="hv-modal-body">
              <div role="alert">
                {workerError && <span className="text-danger">{workerError}</span>}
              </div>
              <p id="worker-dialog-desc">Enter a name for the worker.</p>
              <input
                type="text"
                id="name2"
                name="name2"
                data-testid="worker-name-input"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleWorkerAccept()}
                className="hv-w-100"
              />
              <div className="hv-modal-actions">
                <button
                  type="button"
                  className="hv-btn-primary hv-btn-auto"
                  onClick={handleWorkerAccept}
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dialogState.version && (
        <div className="hv-modal-backdrop" onClick={() => close('version')} role="presentation">
          <div
            ref={versionDialogRef}
            className="hv-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="version-dialog-title"
          >
            <div className="hv-modal-header">
              <h3 id="version-dialog-title">Version Information</h3>
            </div>
            <div className="hv-modal-body">
              <p>
                <strong>Version 2.0</strong>
              </p>
              <ul className="hv-version-notes">
                <li>UI overhaul: dark mode only, major layout and visual update</li>
                <li>
                  Migration to a modern framework for better performance, security and modernization
                </li>
                <li>Game functionality has been maintained</li>
              </ul>
              <div className="hv-modal-actions">
                <button
                  type="button"
                  className="hv-btn-secondary hv-btn-auto"
                  onClick={() => close('version')}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dialogState.confirm && (
        <div className="hv-modal-backdrop" onClick={() => close('confirm')} role="presentation">
          <div
            ref={confirmDialogRef}
            className="hv-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <div className="hv-modal-header">
              <h3 id="confirm-dialog-title">Confirmation Required</h3>
            </div>
            <div className="hv-modal-body">
              <p>This change is permanent, are you sure this is what you want to do?</p>
              <div className="hv-modal-actions">
                <button
                  type="button"
                  className="hv-btn-primary hv-btn-auto"
                  onClick={handleConfirmConfirm}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="hv-btn-secondary hv-btn-auto"
                  onClick={() => close('confirm')}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dialogState.loading && (
        <div className="hv-modal-backdrop" onClick={() => close('loading')} role="presentation">
          <div
            ref={loadingDialogRef}
            className="hv-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="loading-dialog-title"
          >
            <div className="hv-modal-header">
              <h3 id="loading-dialog-title">Old Version</h3>
            </div>
            <div className="hv-modal-body">
              <p>
                You are loading from an old version, there may be errors. If the game does not load
                correctly try starting a new game by refreshing the page. Continue to load the save
                anyway, or Reset to start fresh.
              </p>
              <div className="hv-modal-actions">
                <button
                  type="button"
                  className="hv-btn-primary hv-btn-auto"
                  onClick={handleLoadingAccept}
                >
                  Continue
                </button>
                <button
                  type="button"
                  className="hv-btn-secondary hv-btn-auto"
                  onClick={() => game?.options?.reset?.()}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
