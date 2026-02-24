import app from '../app.js';
import ProductionServiceFactory from '../services/production.service.js';

app.factory('ProductionService', ProductionServiceFactory);

export default ProductionServiceFactory;
