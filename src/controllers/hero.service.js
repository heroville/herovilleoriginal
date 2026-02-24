import app from '../app.js';
import HeroServiceFactory from '../services/hero.service.js';

app.factory('HeroService', HeroServiceFactory);

export default HeroServiceFactory;
