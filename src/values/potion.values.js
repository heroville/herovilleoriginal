import app from "../app";

app.value("potion", 
    {
        id: -1,
        name: "Healing Herbs",
        image: require("../images/P_Red04.png"),
        healing: 20,
        description: "Restores 20% Health consumed on purchase.",
        count: 0,
        maxCount: 5,
        cost: 10,
        prodTime: 5,
        progress: "Create Potion",
        sellPrice: 1,
        working: 0,
        }
);