/**
 * Minimal UI callbacks: error toast, tutorial advance, open hero/worker dialogs.
 * MainController registers its scope once; services that need to show errors or open dialogs use this instead of receiving scope.
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
        openHeroDialog,
        openWorkerDialog
    };
}

export default GameUiServiceFactory;
