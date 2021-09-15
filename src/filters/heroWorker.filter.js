import app from '../app';

app.filter('heroWorker', function () {
    return function (heroList, value) {
        var filtered = [];
        for(var i = 0; i < heroList.length; i++) {
            if (heroList[i].academy.id == 1) {
                filtered.push(heroList[i]);
            }
        }
        return filtered;
    }
}
);