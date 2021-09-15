import app from '../app';

app.directive('ngSlider', function () {
    return {
        scope: true,
        template: "<div class='ng-slider' ng-style='pos' ng-click='randomEvent(randomE.type)' remove-me> <img ng-src='images/{{randomE.image}}' /></div>",
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