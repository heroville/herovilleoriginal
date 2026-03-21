/**
 * Minimal UI callbacks: error toast, tutorial advance, open hero/worker dialogs.
 * Bootstrap registers a scope once; services that need to show errors or open dialogs use this.
 */

interface Scope {
  showError?: (msg: string) => void;
  nextTutorial?: () => void;
  openHeroDialog?: () => void;
  openWorkerDialog?: () => void;
}

function GameUiServiceFactory() {
  let _scope: Scope | null = null;

  function register(scope: Scope): void {
    _scope = scope;
  }

  function showError(msg: string): void {
    if (_scope && typeof _scope.showError === 'function') _scope.showError(msg);
  }

  function nextTutorial(): void {
    if (_scope && typeof _scope.nextTutorial === 'function') _scope.nextTutorial();
  }

  /**
   * Call after state.resources or state.gold may have changed; advances tutorial when thresholds are met.
   */
  function checkTutorialProgress(state: {
    resources: number;
    gold: number;
    tutorialStepIndex: number;
  }): void {
    if (!state) return;
    if (state.resources >= 5 && state.tutorialStepIndex === 1) nextTutorial();
    else if (state.gold === 1 && state.tutorialStepIndex === 7) nextTutorial();
  }

  function openHeroDialog(): void {
    if (_scope && typeof _scope.openHeroDialog === 'function') _scope.openHeroDialog();
  }

  function openWorkerDialog(): void {
    if (_scope && typeof _scope.openWorkerDialog === 'function') _scope.openWorkerDialog();
  }

  return {
    register,
    showError,
    nextTutorial,
    checkTutorialProgress,
    openHeroDialog,
    openWorkerDialog,
  };
}

export type GameUiServiceInstance = ReturnType<typeof GameUiServiceFactory>;

export default GameUiServiceFactory;
