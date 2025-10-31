import app from '../app.js';
import SaveStateServiceFactory from '../services/save-state.service.js';

app.factory('SaveStateService', SaveStateServiceFactory);

export default SaveStateServiceFactory;
