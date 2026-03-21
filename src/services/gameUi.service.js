/**
 * Minimal UI callbacks: error toast, tutorial advance, open hero/worker dialogs.
 * Bootstrap registers a scope once; services that need to show errors or open dialogs use this.
 */

function GameUiServiceFactory() {
  let _scope = null;

  function register(scope) {
    _scope = scope;
  }

  function showError(msg) {
    if (_scope && typeof _scope.showError === 'function') _scope.showError(msg);
  }

  function nextTutorial() {
    if (_scope && typeof _scope.nextTutorial === 'function') _scope.nextTutorial();
  }

  /**
   * Call after state.resources or state.gold may have changed; advances tutorial when thresholds are met.
   * @param {{ resources: number, gold: number, tutorialStepIndex: number }} state
   */
  function checkTutorialProgress(state) {
    if (!state) return;
    if (state.resources >= 5 && state.tutorialStepIndex === 1) nextTutorial();
    else if (state.gold === 1 && state.tutorialStepIndex === 7) nextTutorial();
  }

  function openHeroDialog() {
    if (_scope && typeof _scope.openHeroDialog === 'function') _scope.openHeroDialog();
  }

  function openWorkerDialog() {
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

export default GameUiServiceFactory;
