import app from '../app.js';
import CombatServiceFactory from '../services/combat.service.js';

app.factory('CombatService', ['GameStateService', 'HeroService', 'DungeonService', 'GameUiService', 'GameConfig', '$timeout', CombatServiceFactory]);

export default CombatServiceFactory;
