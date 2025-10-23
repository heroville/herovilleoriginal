import app from '../app.js';
import EconomyServiceFactory from '../services/economy.service.js';

app.factory('EconomyService', EconomyServiceFactory);

export default EconomyServiceFactory;
