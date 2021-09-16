import app from "../app";

app.value('weapons',[
    {
      id: 0,
      name: "Fist",
      cost: 0,
      sellPrice: 0,
      minDamage: 1,
      maxDamage: 1,
      durability: 1,
      enabled: false,
      image: require("../images/W_Fist001.png"),
      progress: "",
      prodTime: 5,
      count: 0,
      maxCount: 5,
      working: 0,
      heroClass: [0],
      broken: false,
    },
    {
      id: 1,
      name: "Dagger",
      cost: 15,
      sellPrice: 1,
      minDamage: 1,
      maxDamage: 3,
      durability: 100,
      enabled: false,
      image: require("../images/W_Dagger002.png"),
      progress: "Create Dagger",
      prodTime: 5,
      count: 0,
      maxCount: 5,
      working: 0,
      heroClass: [0, 2],
      broken: false,
    },
    {
      id: 2,
      name: "Hand Axe",
      cost: 30,
      sellPrice: 3,
      minDamage: 1,
      maxDamage: 6,
      durability: 100,
      enabled: false,
      image: require("../images/W_Axe001.png"),
      progress: "Create Hand Axe",
      prodTime: 10,
      count: 0,
      maxCount: 5,
      working: 0,
      heroClass: [2],
      broken: false,
    },
    {
      id: 3,
      name: "Short Sword",
      cost: 50,
      sellPrice: 6,
      minDamage: 1,
      maxDamage: 10,
      durability: 100,
      enabled: false,
      image: require("../images/W_Sword001.png"),
      progress: "Create Short Sword",
      prodTime: 16,
      count: 0,
      maxCount: 5,
      working: 0,
      heroClass: [2],
      broken: false,
    },
    {
      id: 4,
      name: "Spear",
      cost: 75,
      sellPrice: 10,
      minDamage: 1,
      maxDamage: 15,
      durability: 100,
      enabled: false,
      image: require("../images/W_Spear003.png"),
      progress: "Create Spear",
      prodTime: 23,
      count: 0,
      maxCount: 5,
      working: 0,
      heroClass: [2],
      broken: false,
    },
    {
      id: 5,
      name: "Mace",
      cost: 105,
      sellPrice: 15,
      minDamage: 1,
      maxDamage: 21,
      durability: 100,
      enabled: false,
      image: require("../images/W_Mace004.png"),
      progress: "Create Mace",
      prodTime: 31,
      count: 0,
      maxCount: 5,
      working: 0,
      heroClass: [2],
      broken: false,
    },
    {
      id: 6,
      name: "Double Axe",
      cost: 140,
      sellPrice: 21,
      minDamage: 1,
      maxDamage: 28,
      durability: 100,
      enabled: false,
      image: require("../images/W_Axe003.png"),
      progress: "Create Double Axe",
      prodTime: 40,
      count: 0,
      maxCount: 5,
      working: 0,
      heroClass: [2],
      broken: false,
    },
    {
      id: 7,
      name: "Flail",
      cost: 180,
      sellPrice: 28,
      minDamage: 1,
      maxDamage: 36,
      durability: 100,
      enabled: false,
      image: require("../images/W_Mace005.png"),
      progress: "Create Flail",
      prodTime: 50,
      count: 0,
      maxCount: 5,
      working: 0,
      heroClass: [2],
      broken: false,
    },
    {
      id: 8,
      name: "Trident",
      cost: 225,
      sellPrice: 36,
      minDamage: 1,
      maxDamage: 45,
      durability: 100,
      enabled: false,
      image: require("../images/W_Spear007.png"),
      progress: "Create Trident",
      prodTime: 61,
      count: 0,
      maxCount: 5,
      working: 0,
      heroClass: [2],
      broken: false,
    },
    {
      id: 9,
      name: "Dark Blade",
      cost: 275,
      sellPrice: 45,
      minDamage: 1,
      maxDamage: 55,
      durability: 100,
      enabled: false,
      image: require("../images/W_Spear014.png"),
      progress: "Create Dark Blade",
      prodTime: 73,
      count: 0,
      maxCount: 5,
      working: 0,
      heroClass: [2],
      broken: false,
    },
    {
      id: 10,
      name: "Great Axe",
      cost: 330,
      sellPrice: 55,
      minDamage: 1,
      maxDamage: 66,
      durability: 100,
      enabled: false,
      image: require("../images/W_Axe011.png"),
      progress: "Create Great Axe",
      prodTime: 86,
      count: 0,
      maxCount: 5,
      working: 0,
      heroClass: [2],
      broken: false,
    },
  ]);