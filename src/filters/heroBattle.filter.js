import app from '../app';

app.filter('heroBattle', function () {
    return function (items, value) {
        var filtered = [];
        for (i = 0; i < items.length; i++) {
            for (j = 0; j < items[i].hero.length; j++)
            if (items[i].hero[j].id == value.id) {
                filtered.push(items[i]);
            }
        }
        return filtered;
    };
});