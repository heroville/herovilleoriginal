import app from "../app";

app.value('blueprints',[
    {
      id: 0,
      name: "Blacksmith Blueprint",
      cost: 1,
      buildingID: 3,
      enabled: false,
      description:
        "Allows you to construct weapons which can be sold to the hero for gold.",
    },
    {
      id: 1,
      name: "Redundant",
      cost: 3,
      buildingID: -1,
      enabled: false,
      description:
        "Allows a hero to save their progress, when they die in a dungeon they will keep all experience, loot and gold.",
    },
    {
      id: 2,
      name: "Tavern Blueprint",
      cost: 5,
      buildingID: 4,
      enabled: false,
      description:
        "Allows you to purchase Upgrades giving small bonuses to many different things.",
    },
    {
      id: 3,
      name: "Alchemist Blueprint",
      cost: 10,
      buildingID: 5,
      enabled: false,
      description:
        "Allows you to construct potions that provide benefits to the hero.",
    },
    {
      id: 4,
      name: "Bestiary",
      cost: 15,
      buildingID: -2,
      enabled: false,
      description:
        "Enabled the Beastiary where you can see the different types of monsters in this game",
    },
    {
      id: 5,
      name: "",
    },
    {
      id: 6,
      name: "",
    },
    {
      id: 7,
      name: "Elite Dungeon",
      cost: 25,
      buildingID: 8,
      enabled: false,
      description: "Unlocks dungeons for Parties to explore",
    },
  ]);