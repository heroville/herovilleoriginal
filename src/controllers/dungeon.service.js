import app from '../app.js';
import DungeonServiceFactory from '../services/dungeon.service.js';

app.factory('DungeonService', ['GameStateService', '$timeout', '$injector', DungeonServiceFactory]);

export default DungeonServiceFactory;
