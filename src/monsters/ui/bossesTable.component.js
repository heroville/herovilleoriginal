import app from '../../app';
import template from './bossesTable.html';

app.component('bossesTable', {
    template: template,
    controller: function BossTableController(bosses, dungeons) {
        this.bosses = bosses;
        this.dungeons = dungeons;
    }
});