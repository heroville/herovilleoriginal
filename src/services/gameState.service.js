/**
 * Single source of truth for all mutable game state.
 * UI and services read/write the same object via getState().
 */
import DEFAULT_JOBS from '../../public/models/jobs.json';
import DEFAULT_UPGRADES from '../../public/models/upgrades.json';

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function GameStateServiceFactory(GameConfig) {
  const buildings = deepCopy(GameConfig.buildings || []);
  const blueprints = deepCopy(GameConfig.blueprints || []);
  const jobs = deepCopy(DEFAULT_JOBS);
  const upgrades = deepCopy(DEFAULT_UPGRADES);
  const weapons = deepCopy(GameConfig.weapons || []);
  const potions = deepCopy(GameConfig.potions || []);
  const events = deepCopy(GameConfig.events || []);
  const heroClasses = deepCopy(GameConfig.heroClasses || []);

  const state = {
    panel: [],
    panelNumber: 0,
    showTutorial: true,
    panelInfo: false,
    tutorialStepIndex: 0,
    tutorialCompleted: false,
    gameLog: [],
    resources: 0,
    maxResources: 25,
    gold: 0,
    maxGold: 0,
    incr: 1,
    restAmount: 2,
    tempClass: null,
    tempHero: null,
    successCount: { amount: 3 },
    lossCount: { amount: 1 },
    randomEventTimer: 600000 + Math.floor(Math.random() * 600000),
    randomE: undefined,
    gameLoop: 1000,
    damageMulti: 1,
    goldMulti: 1,
    version: '2.0',
    optionsSuccess: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    optionsLoss: [1, 2, 3, 4],
    sorting: {
      heroTable: 'name',
      monList: 'value',
      bossList: 'value',
      heroWork: 'job.id',
      strict: true,
    },
    predicate: 'name',
    bestiary: false,
    heroTable: false,
    showHeroTable: {},
    selectedDungeon: 0,
    heroEnabled: false,
    prodEnabled: false,
    upgEnabled: false,
    beastEnabled: false,
    hFilterString: {},
    heroCollapse: true,
    heroList: [],
    dungeons: [],
    monsters: [],
    bosses: [],
    party: [],
    battles: [],
    journeys: [],
    bossBattle: [],
    heroName: null,
    monsterList: null,
    dungeonNames: null,
    gameStats: {
      battles: 0,
      wins: 0,
      losses: 0,
      weaponsAuto: 0,
      weaponsManual: [],
      buffs: 0,
      clicks: 0,
    },
    buildings,
    jobs,
    upgrades,
    blueprints,
    weapons,
    potion: {
      id: -1,
      name: 'Healing Herbs',
      image: 'P_Red04.png',
      healing: 20,
      description: 'Restores 20% Health consumed on purchase.',
      count: 0,
      maxCount: 5,
      cost: 10,
      prodTime: 5,
      progress: 'Create Potion',
      sellPrice: 1,
      working: 0,
    },
    potions,
    events,
    heroClass: heroClasses,
  };

  function getState() {
    return state;
  }

  return {
    getState,
  };
}

export default GameStateServiceFactory;
