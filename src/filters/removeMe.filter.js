import app from '../app';

app.directive("removeMe", function ($rootScope) {
    return {
        link: function (scope, element, attrs) {
            element.bind("click", function () {
                element.remove();
            });
        }
    }

});