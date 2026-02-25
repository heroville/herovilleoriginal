const app = window.angular.module('Incremental', ['ngAnimate', 'ui.bootstrap', 'angulartics', 'angulartics.google.analytics']);
window.app = app;

app.directive('ngSlider', function () {
    return {
        scope: true,
        template: "<div class='ng-slider' ng-style='pos' ng-click='randomEvent(state.randomE.type)' remove-me> <img ng-src='images/{{state.randomE.image}}' /></div>",
        replace: true,
        controller: function ($scope, $interval) {

            $scope.pos = {
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%"
            };

            $scope.newPos = function () {
                // calculate however you'd like:
                $scope.pos.top = Math.random() * 100 + "%";
                $scope.pos.left = Math.random() * 100 + "%";
            }

            $interval($scope.newPos, 2000);
        }
    };
});

app.directive("removeMe", function ($rootScope) {
    return {
        link: function (scope, element, attrs) {
            element.bind("click", function () {
                element.remove();
            });
        }
    }

});

app.filter('heroBattle', function () {
    return function (items, value) {
        var filtered = [];
        for (let i = 0; i < items.length; i++) {
            for (let j = 0; j < items[i].hero.length; j++)
            if (items[i].hero[j].id == value.id) {
                filtered.push(items[i]);
            }
        }
        return filtered;
    };
});

app.filter('heroWorker', function () {
    return function (heroList, value) {
        var filtered = [];
        for (let i = 0; i < heroList.length; i++) {
            if (heroList[i].academy.id == 1) {
                filtered.push(heroList[i]);
            }
        }
        return filtered;
    }
}
);

app.filter('heroAdventure', function () {
    return function (heroList, value) {
        var filtered = [];
        for (let i = 0; i < heroList.length; i++) {
            if (heroList[i].academy.id == 0 || heroList[i].academy.id == 2) {
                filtered.push(heroList[i]);
            }
        }
        return filtered;
    }
}
);

export default app;



