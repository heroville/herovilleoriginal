import app from '../app.js';
import GameStateServiceFactory from '../services/gameState.service.js';

app.factory('GameStateService', ['GameConfig', GameStateServiceFactory]);

export default GameStateServiceFactory;
