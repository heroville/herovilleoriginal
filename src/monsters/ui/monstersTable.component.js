import app from '../../app';
import template from './monstersTable.html';

app.component('monstersTable', {
    template: template,
    controller: function MonstersTableController(monsters) {
        this.monsters = monsters;
    }
});