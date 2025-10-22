const appModule = require('./app.module');
const app = appModule.default || appModule;

app.directive('ngSlider', function () {
  return {
    scope: true,
    template: "<div class='ng-slider' ng-style='pos' ng-click='randomEvent(randomE.type)' remove-me><img ng-src='images/{{randomE.image}}' /></div>",
    replace: true,
    controller: function ($scope, $interval) {
      $scope.pos = {
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
      };

      $scope.newPos = function () {
        $scope.pos.top = Math.random() * 100 + '%';
        $scope.pos.left = Math.random() * 100 + '%';
      };

      $interval($scope.newPos, 2000);
    },
  };
});

app.directive('removeMe', function () {
  return {
    link: function (scope, element) {
      element.bind('click', function () {
        element.remove();
      });
    },
  };
});

app.filter('heroBattle', function () {
  return function (items, value) {
    const filtered = [];
    for (let i = 0; i < items.length; i += 1) {
      for (let j = 0; j < items[i].hero.length; j += 1) {
        if (items[i].hero[j].id === value.id) {
          filtered.push(items[i]);
        }
      }
    }
    return filtered;
  };
});

app.filter('heroWorker', function () {
  return function (heroList) {
    const filtered = [];
    for (let i = 0; i < heroList.length; i += 1) {
      if (heroList[i].academy.id === 1) {
        filtered.push(heroList[i]);
      }
    }
    return filtered;
  };
});

app.filter('heroAdventure', function () {
  return function (heroList) {
    const filtered = [];
    for (let i = 0; i < heroList.length; i += 1) {
      if (heroList[i].academy.id === 0 || heroList[i].academy.id === 2) {
        filtered.push(heroList[i]);
      }
    }
    return filtered;
  };
});

module.exports = app;
module.exports.default = app;
