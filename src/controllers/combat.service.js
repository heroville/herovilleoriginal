import app from '../app.js';
import CombatServiceFactory from '../services/combat.service.js';

app.factory('CombatService', CombatServiceFactory);

export default CombatServiceFactory;
