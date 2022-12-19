import app from "../../app";

app.service("goldService", function GoldService(resources) {

    this.incGold = function (value) {
        let addedGold = value * resources.goldMulti;
        if (addedGold + resources.gold < resources.maxGold) {
            resources.gold += addedGold;
        } else {
            resources.gold = resources.maxGold;
        }
      };

      this.decGold = function canSpendGold(value, subtract = false) {
        if (value > resources.gold) {
          return false;
        }       
        if (subtract) {
            resources.gold -= value;
        }       
        return true;
      }
});