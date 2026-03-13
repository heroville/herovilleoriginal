// Tutorial steps: content and showNext. Step indices match triggers in
// BuildingService, ProductionService, GameUiService.

export const TUTORIAL_TOTAL_STEPS = 23;

/**
 * Returns the tutorial step index (0–22) implied by current game state.
 * Used to skip ahead when the player has already done the goal of earlier steps.
 * @param {Object} flat - Flat state (resources, gold, buildings, heroList, upgrades, etc.)
 */
export function getTutorialStepFromState(flat) {
  if (!flat) return 0;
  const buildings = flat.buildings || [];
  const heroList = flat.heroList || [];
  const upgrades = flat.upgrades || [];
  const gold = flat.gold ?? 0;
  const resources = flat.resources ?? 0;
  const potion = flat.potion || {};
  const weapons = flat.weapons || [];
  const blueprints = flat.blueprints || [];
  const dungeons = flat.dungeons || [];

  const tentCount = buildings[0]?.count ?? 0;
  const stockpileCount = buildings[1]?.count ?? 0;
  const marketCount = buildings[2]?.count ?? 0;
  const blacksmithCount = buildings[3]?.count ?? 0;
  const tavernCount = buildings[4]?.count ?? 0;
  const hasHero = heroList.length >= 1;
  const bonusResBought = upgrades[0]?.enabled === false;
  const savePointBought = upgrades[1]?.enabled === false;
  const potionCount = (potion.count ?? 0) + (potion.working ?? 0);
  const hasWeapon = weapons.length > 0 && (weapons[0]?.count ?? 0) + (weapons[0]?.working ?? 0) >= 1;
  const blacksmithBlueprintBought = blueprints[0]?.enabled === false && (buildings[3]?.enabled === true || blacksmithCount >= 1);
  const dungeonCount = dungeons.length;

  // Highest first: return first (highest) step whose goal is already met
  if (tavernCount >= 1) return 19;
  if (savePointBought) return 18;
  if (hasWeapon) return 16;
  if (blacksmithCount >= 1) return 15;
  if (blacksmithBlueprintBought) return 14;
  if (marketCount >= 1) return 13;
  if (dungeonCount >= 1) return 11;
  if (bonusResBought) return 9;
  if (gold >= 1) return 8;
  if (potionCount >= 1) return 7;
  if (stockpileCount >= 1) return 6;
  if (hasHero || tentCount >= 1) return 3;
  if (resources >= 5) return 2;
  return 0;
}

export const TUTORIAL_STEPS = [
  {
    id: 0,
    text: "Welcome to HeroVille. You're in charge of a new town. Attract heroes, have them adventure and spend gold so your town can grow.",
    showNext: true
  },
  {
    id: 1,
    text: "Start by gathering resources: click the resource count at the top until you have 5, then open Town and click Improve Tent to build your first tent.",
    showNext: false
  },
  {
    id: 2,
    text: "Click Improve Tent (costs 5 resources) to build the tent and unlock your first hero. You can name them or keep the default.",
    showNext: false
  },
  {
    id: 3,
    text: "You have your first hero. Open the Heroes tab to see their level, health, XP, inventory, and adventure status.",
    showNext: true
  },
  {
    id: 4,
    text: "Heroes earn gold in dungeons but won’t hand it over for free. You need to offer items and services so they spend gold in town.",
    showNext: true
  },
  {
    id: 5,
    text: "Expand the Stockpile to store gold: gather 25 resources, then click Improve Stockpile on the Town tab.",
    showNext: false
  },
  {
    id: 6,
    text: "The Stockpile also unlocks Production. Gather 25 resources, open Production, and click Create Potion.",
    showNext: false
  },
  {
    id: 7,
    text: "Production takes a few seconds. When your hero returns damaged, they’ll buy the potion for 1 gold and heal; that gold goes to the town.",
    showNext: true
  },
  {
    id: 8,
    text: "Spend your first gold on the Bonus Resources I upgrade (Upgrades tab) to get 2 resources per click instead of 1.",
    showNext: false
  },
  {
    id: 9,
    text: "Upgrades are permanent. Keep an eye on the Upgrades tab for more bonuses.",
    showNext: true
  },
  {
    id: 10,
    text: "Heroes stop gaining XP at level 3 until they fight in harder dungeons. On Town, gather 25 resources and click Improve Dungeons.",
    showNext: false
  },
  {
    id: 11,
    text: "New dungeons appear on the Town tab. Heroes will try them after enough wins in the previous dungeon. Keep upgrading dungeons for more XP.",
    showNext: true
  },
  {
    id: 12,
    text: "Stronger dungeons need better gear. Build a Market first: gather 40 resources and click Improve Market.",
    showNext: false
  },
  {
    id: 13,
    text: "The Market unlocks blueprints. In Production, buy the Blacksmith Blueprint for 1 gold. You can create more potions or another tent while you wait.",
    showNext: false
  },
  {
    id: 14,
    text: "Build the Blacksmith from the Town tab. Expand the Stockpile if needed, then gather 100 resources and click Improve Blacksmith.",
    showNext: false
  },
  {
    id: 15,
    text: "In Production, the Dagger is now available. Gather 15 resources and click Create Dagger so your hero can clear tougher dungeons.",
    showNext: false
  },
  {
    id: 16,
    text: "Weapons have durability and break after use. If one breaks in a dungeon, the hero fights with their fists until they return.",
    showNext: true
  },
  {
    id: 17,
    text: "When a hero loses a fight they reset to level 1. The Save Point upgrade (3 gold) lets them keep XP and gold on defeat. Use potions and weapons to earn 3 gold and buy it.",
    showNext: false
  },
  {
    id: 18,
    text: "At level 5, the Tavern blueprint appears (5 gold). It unlocks classes: Adventurer and Labourer. Buy the blueprint, then gather 150 and click Improve Tavern on Town.",
    showNext: false
  },
  {
    id: 19,
    text: "The Professions tab lists classes and heroes without one. Adventurers can equip better weapons; Labourers gather and produce for the town but cannot adventure.",
    showNext: true
  },
  {
    id: 20,
    text: "Labourers are permanent. Don’t make everyone a Labourer. At level 10 the Academy unlocks more classes—see the Professions tab for details.",
    showNext: true
  },
  {
    id: 21,
    text: "That’s the basics. This guide will become a game log for events. More features unlock as you play. Good luck!",
    showNext: true
  },
  {
    id: 22,
    text: "",
    showNext: false
  }
];
