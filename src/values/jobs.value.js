import app from "../app";

app.value('jobs',[
    {
      id: 0,
      name: "Gather",
      current: 0,
      limit: 100,
      enabled: true,
      description: "A Gathering hero will collect resources every second.",
    },
    {
      id: 1,
      name: "Apothecary",
      current: 0,
      limit: 1,
      enabled: false,
      description: "An Apothecary will make potions.",
    },
    {
      id: 2,
      name: "Smith",
      current: 0,
      limit: 1,
      enabled: false,
      description: "A Smith will produce weapons.",
    }
]
   );