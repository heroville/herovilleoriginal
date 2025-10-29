const gameConfig = {
        buildings: [
            {
                id: 0,
                name: 'Tent',
                count: 0,
                enabled: true,
                tier: 1,
                cost: 5,
                multiplier: 4,
                description: "This building allows heroes to join the town."
            },
            {
                id: 1,
                name: 'Stockpile',
                count: 0,
                enabled: false,
                tier: 1,
                cost: 25,
                multiplier: 5,
                description: "Adds the Ability to create potions to sell to heroes for gold as well as extending the gold and resource capacities."
            },
            {
                id: 2,
                name: 'Market',
                count: 0,
                enabled: false,
                tier: 1,
                cost: 40,
                multiplier: 10,
                description: "Allows you to purchase blueprints which unlock new buildings."
            },
            {
                id: 3,
                name: 'Blacksmith',
                count: 0,
                enabled: false,
                tier: 1,
                cost: 100,
                multiplier: 5,
                description: "Allows you to construct weapons which can be sold to the hero for gold."
            },
            {
                id: 4,
                name: 'Tavern',
                count: 0,
                tier: 1,
                cost: 150,
                multiplier: 5,
                description: "Allows you to purchase Upgrades giving small bonuses to many different things."
            },
            {
                id: 5,
                name: 'Alchemist',
                count: 0,
                tier: 1,
                cost: 1000,
                multiplier: 5,
                description: "Allows you to construct better potions that provide benefits to the hero."
            },
            {
                id: 6,
                name: 'Dungeons',
                count: 1,
                enabled: false,
                tier: 1,
                cost: 25,
                multiplier: 5,
                description: "Discovers a new Dungeon for your heroes"
            },
            {
                id: 7,
                name: 'Academy',
                count: 0,
                enabled: false,
                tier: 1,
                cost: 10000,
                multiplier: 1,
                description: "Allows heroes to gain a class"
            },
            {
                id: 8,
                name: 'Elite Dungeons',
                count: 0,
                enabled: false,
                tier: 1,
                cost: 35000,
                multiplier: 5,
                description: "Allows parties to adventure into elite dungeons."
            },
            {
                id: 9,
                name: 'Work Hut',
                count: 0,
                enabled: false,
                tier: 1,
                cost: 100,
                multiplier: 4,
                description: "Allows you to train workers and gatherers."
            }
        ],
        blueprints: [
            {
                id: 0,
                name: 'Blacksmith Blueprint',
                cost: 1,
                buildingID: 3,
                enabled: false,
                description: "Allows you to construct weapons which can be sold to the hero for gold."
            },
            {
                id: 1,
                name: 'Redundant',
                cost: 3,
                buildingID: -1,
                enabled: false,
                description: "Allows a hero to save their progress, when they die in a dungeon they will keep all experience, loot and gold."
            },
            {
                id: 2,
                name: 'Tavern Blueprint',
                cost: 5,
                buildingID: 4,
                enabled: false,
                description: "Allows you to purchase Upgrades giving small bonuses to many different things."
            },
            {
                id: 3,
                name: 'Alchemist Blueprint',
                cost: 10,
                buildingID: 5,
                enabled: false,
                description: "Allows you to construct potions that provide benefits to the hero."
            },
            {
                id: 4,
                name: 'Bestiary',
                cost: 15,
                buildingID: -2,
                enabled: false,
                description: "Enabled the Bestiary where you can see the different types of monsters in this game"
            },
            {
                id: 5,
                name: ''
            },
            {
                id: 6,
                name: ''
            },
            {
                id: 7,
                name: 'Elite Dungeon',
                cost: 25,
                buildingID: 8,
                enabled: false,
                description: "Unlocks dungeons for Parties to explore"
            }
        ],
        weapons: [
            {
                id: 0,
                name: 'Fist',
                cost: 0,
                sellPrice: 0,
                minDamage: 1,
                maxDamage: 1,
                durability: 1,
                enabled: false,
                image: "W_Fist001.png",
                progress: "",
                prodTime: 5,
                count: 0,
                maxCount: 5,
                working: 0,
                heroClass: [0],
                broken: false
            },
            {
                id: 1,
                name: 'Dagger',
                cost: 15,
                sellPrice: 1,
                minDamage: 1,
                maxDamage: 3,
                durability: 100,
                enabled: false,
                image: "W_Dagger002.png",
                progress: "Create Dagger",
                prodTime: 5,
                count: 0,
                maxCount: 5,
                working: 0,
                heroClass: [0, 2],
                broken: false
            },
            {
                id: 2,
                name: 'Hand Axe',
                cost: 30,
                sellPrice: 3,
                minDamage: 1,
                maxDamage: 6,
                durability: 100,
                enabled: false,
                image: "W_Axe001.png",
                progress: "Create Hand Axe",
                prodTime: 10,
                count: 0,
                maxCount: 5,
                working: 0,
                heroClass: [2],
                broken: false
            },
            {
                id: 3,
                name: 'Short Sword',
                cost: 50,
                sellPrice: 6,
                minDamage: 1,
                maxDamage: 10,
                durability: 100,
                enabled: false,
                image: "W_Sword001.png",
                progress: "Create Short Sword",
                prodTime: 16,
                count: 0,
                maxCount: 5,
                working: 0,
                heroClass: [2],
                broken: false
            },
            {
                id: 4,
                name: 'Spear',
                cost: 75,
                sellPrice: 10,
                minDamage: 1,
                maxDamage: 15,
                durability: 100,
                enabled: false,
                image: "W_Spear003.png",
                progress: "Create Spear",
                prodTime: 23,
                count: 0,
                maxCount: 5,
                working: 0,
                heroClass: [2],
                broken: false
            },
            {
                id: 5,
                name: 'Mace',
                cost: 105,
                sellPrice: 15,
                minDamage: 1,
                maxDamage: 21,
                durability: 100,
                enabled: false,
                image: "W_Mace004.png",
                progress: "Create Mace",
                prodTime: 31,
                count: 0,
                maxCount: 5,
                working: 0,
                heroClass: [2],
                broken: false
            },
            {
                id: 6,
                name: 'Double Axe',
                cost: 140,
                sellPrice: 21,
                minDamage: 1,
                maxDamage: 28,
                durability: 100,
                enabled: false,
                image: "W_Axe003.png",
                progress: "Create Double Axe",
                prodTime: 40,
                count: 0,
                maxCount: 5,
                working: 0,
                heroClass: [2],
                broken: false
            },
            {
                id: 7,
                name: 'Flail',
                cost: 180,
                sellPrice: 28,
                minDamage: 1,
                maxDamage: 36,
                durability: 100,
                enabled: false,
                image: "W_Mace005.png",
                progress: "Create Flail",
                prodTime: 50,
                count: 0,
                maxCount: 5,
                working: 0,
                heroClass: [2],
                broken: false
            },
            {
                id: 8,
                name: 'Trident',
                cost: 225,
                sellPrice: 36,
                minDamage: 1,
                maxDamage: 45,
                durability: 100,
                enabled: false,
                image: "W_Spear007.png",
                progress: "Create Trident",
                prodTime: 61,
                count: 0,
                maxCount: 5,
                working: 0,
                heroClass: [2],
                broken: false
            },
            {
                id: 9,
                name: 'Dark Blade',
                cost: 275,
                sellPrice: 45,
                minDamage: 1,
                maxDamage: 55,
                durability: 100,
                enabled: false,
                image: "W_Spear014.png",
                progress: "Create Dark Blade",
                prodTime: 73,
                count: 0,
                maxCount: 5,
                working: 0,
                heroClass: [2],
                broken: false
            },
            {
                id: 10,
                name: 'Great Axe',
                cost: 330,
                sellPrice: 55,
                minDamage: 1,
                maxDamage: 66,
                durability: 100,
                enabled: false,
                image: "W_Axe011.png",
                progress: "Create Great Axe",
                prodTime: 86,
                count: 0,
                maxCount: 5,
                working: 0,
                heroClass: [2],
                broken: false
            }
        ],
        potions: [
            {
                id: 0,
                name: "Regeneration",
                image: "P_Green02.png",
                description: "Restores 2% Health each turn during the fight",
                prodTime: 5,
                progress: "Create Regeneration Potion",
                sellPrice: 3,
                count: 0,
                maxCount: 5,
                maxHero: 10,
                type: 3,
                cost: 100,
                active: false,
                value: 2,
                working: 0
            },
            {
                id: 1,
                name: "Power",
                image: "P_ORange02.png",
                description: "Multiplies damage by 1.5 for one fight",
                prodTime: 5,
                progress: "Create Power Potion",
                sellPrice: 4,
                count: 0,
                maxCount: 5,
                maxHero: 10,
                type: 2,
                cost: 100,
                active: false,
                value: 1.5,
                working: 0
            },
            {
                id: 2,
                name: "Health",
                image: "P_Red02.png",
                description: "Restores 50 Health when consumed",
                prodTime: 5,
                progress: "Create Health Potion",
                sellPrice: 5,
                count: 0,
                maxCount: 5,
                maxHero: 10,
                type: 1,
                cost: 100,
                active: false,
                value: 50,
                working: 0
            },
            {
                id: 3,
                name: "Good Health",
                image: "P_Red03.png",
                description: "Restores 100 Health when consumed",
                prodTime: 5,
                progress: "Create Good Health Potion",
                sellPrice: 10,
                count: 0,
                maxCount: 5,
                maxHero: 10,
                type: 1,
                cost: 100,
                active: false,
                value: 100,
                working: 0
            },
            {
                id: 4,
                name: "Greater Health",
                image: "P_Red01.png",
                description: "Restores 200 Health when consumed",
                prodTime: 5,
                progress: "Create Greater Health Potion",
                sellPrice: 15,
                count: 0,
                maxCount: 5,
                maxHero: 10,
                type: 1,
                cost: 100,
                active: false,
                value: 200,
                working: 0
            }
        ],
        events: [
            {
                type: "Wealth",
                image: "E_Gold02.png"
            },
            {
                type: "Power",
                image: "S_Shadow07.png"
            },
            {
                type: "Speed",
                image: "S_Buff11.png"
            }
        ],
        heroClasses: [
            {
                id: 0,
                name: "None"
            },
            {
                id: 1,
                name: "Labourer"
            },
            {
                id: 2,
                name: "Adventurer"
            }
        ]
};

export default gameConfig;
