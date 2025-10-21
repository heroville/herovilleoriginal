/* global app */
(function () {
    'use strict';

    function ensureState(state) {
        if (!state) {
            throw new Error('EconomyService requires a bound state before use.');
        }
        return state;
    }

    function EconomyServiceFactory() {
        var boundState = null;

        function getState() {
            return ensureState(boundState);
        }

        function bindState(state) {
            boundState = state;
            return boundState;
        }

        function incResources(value) {
            var state = getState();
            var amount = Number(value) || 0;
            var availableSpace = state.maxResources - state.resources;
            if (amount < availableSpace) {
                state.resources += amount;
            }
            else {
                state.resources = state.maxResources;
            }
            return state.resources;
        }

        function decResources(value) {
            var state = getState();
            var amount = Number(value) || 0;
            if (state.resources >= amount) {
                state.resources -= amount;
                return true;
            }
            return false;
        }

        function incGold(value) {
            var state = getState();
            var amount = (Number(value) || 0) * (state.goldMulti || 1);
            var availableSpace = state.maxGold - state.gold;
            if (amount < availableSpace) {
                state.gold += amount;
            }
            else {
                state.gold = state.maxGold;
            }
            return state.gold;
        }

        function decGold(value) {
            var state = getState();
            var amount = Number(value) || 0;
            if (state.gold >= amount) {
                state.gold -= amount;
                return true;
            }
            return false;
        }

        return {
            bindState: bindState,
            incResources: incResources,
            decResources: decResources,
            incGold: incGold,
            decGold: decGold,
            getState: getState
        };
    }

    if (typeof app !== 'undefined' && app.factory) {
        app.factory('EconomyService', EconomyServiceFactory);
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = EconomyServiceFactory;
    }
}());
