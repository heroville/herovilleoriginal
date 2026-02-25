import app from '../app.js';
import BuildingServiceFactory from '../services/building.service.js';

app.factory('BuildingService', ['GameStateService', 'GameUiService', 'DungeonService', 'ProductionService', BuildingServiceFactory]);

export default BuildingServiceFactory;
