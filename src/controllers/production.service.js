import app from '../app.js';
import ProductionServiceFactory from '../services/production.service.js';

app.factory('ProductionService', ['EconomyService', 'GameUiService', ProductionServiceFactory]);

export default ProductionServiceFactory;
