import app from '../app.js';
import HeroServiceFactory from '../services/hero.service.js';

app.factory('HeroService', ['GameConfig', 'EconomyService', 'GameStateService', 'GameUiService', 'DungeonService', 'ProductionService', 'UtilService', HeroServiceFactory]);

export default HeroServiceFactory;
