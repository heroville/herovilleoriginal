import app from '../../app';
import template from './heroList.html';

app.component('heroList', { 
    template: template,
    controller : function HeroListController(heroList, heroClass) {
        this.heroList = heroList;
        this.heroClass = heroClass;
    }
});