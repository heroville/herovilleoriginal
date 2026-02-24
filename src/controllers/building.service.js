import app from '../app.js';
import BuildingServiceFactory from '../services/building.service.js';

app.factory('BuildingService', BuildingServiceFactory);

export default BuildingServiceFactory;
