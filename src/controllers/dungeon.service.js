import app from '../app.js';
import DungeonServiceFactory from '../services/dungeon.service.js';

app.factory('DungeonService', DungeonServiceFactory);

export default DungeonServiceFactory;
