import app from "../../app";

app.value('buildings', [
    {
      id: 'tent',
      name: "Tent",
      count: 0,
      enabled: true,
      tier: 1,
      baseCost : 5,
      cost: 5,
      multiplier: 4,
      description: "This building allows heroes to join the town.",
    },
    {
      id: 'stockpile',
      name: "Stockpile",
      count: 0,
      enabled: false,
      tier: 1, 
      baseCost : 25,
      cost: 25,
      multiplier: 25,
      description:
        "Adds the Ability to create potions to sell to heroes for gold as well as extending the gold and resource capacities.",
    },
    {
      id: 'market',
      name: "Market",
      count: 0,
      enabled: false,
      tier: 1,  
      baseCost : 40,
      cost: 40,
      multiplier: 1.07,
      description:
        "Allows you to purchase blueprints which unlock new buildings.",
    },
    {
      id: 'blacksmith',
      name: "Blacksmith",
      count: 0,
      enabled: false,
      tier: 1,
      baseCost : 100,
      cost: 100,
      multiplier: 1.07,
      description:
        "Allows you to construct weapons which can be sold to the hero for gold.",
    },
    {
      id: 'tavern',
      name: "Tavern",
      count: 0,
      tier: 1,
      baseCost : 150,
      cost: 150,
      multiplier: 1.07,
      description:
        "Allows you to purchase Upgrades giving small bonuses to many different things.",
    },
    {
      id: 'alchemist',
      name: "Alchemist",
      count: 0,
      tier: 1,
      baseCost : 1000,
      cost: 1000,
      multiplier: 1.07,
      description:
        "Allows you to construct better potions that provide benefits to the hero.",
    },
    {
      id: 'dungeons',
      name: "Dungeons",
      count: 1,
      enabled: false,
      tier: 1,
      baseCost : 25,
      cost: 25,
      multiplier: 1.07,
      description: "Discovers a new Dungeon for your heroes",
    },
    {
      id: 'academy',
      name: "Academy",
      count: 0,
      enabled: false,
      tier: 1,
      baseCost : 10000,
      cost: 10000,
      multiplier: 1.07,
      description: "Allows heroes to gain a class",
    },
    {
      id: 'eliteDungeons',
      name: "Elite Dungeons",
      count: 0,
      enabled: false,
      tier: 1,
      baseCost : 35000,
      cost: 35000,
      multiplier: 1.07,
      description: "Allows parties to adventure into elite dungeons.",
    },
    {
      id: 'workHut',
      name: "Work Hut",
      count: 0,
      enabled: false,
      teir: 1,
      baseCost : 100,
      cost: 100,
      multiplier: 1.07,
      description: "Allows you to train workers and gatherers.",
    },
  ]);