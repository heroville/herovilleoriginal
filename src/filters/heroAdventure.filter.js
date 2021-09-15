import app from '../app';

app.filter('heroAdventure', function () {
    return function (heroList, value) {
        var filtered = [];
        for(var i = 0; i < heroList.length; i++) {
            if (heroList[i].academy.id == 0 || heroList[i].academy.id == 2) {
                filtered.push(heroList[i]);
            }
        }
        return filtered;
    }
}
);