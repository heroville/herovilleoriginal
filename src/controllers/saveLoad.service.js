import app from '../app.js';
import SaveLoadServiceFactory from '../services/saveLoad.service.js';

app.factory('SaveLoadService', SaveLoadServiceFactory);

export default SaveLoadServiceFactory;
