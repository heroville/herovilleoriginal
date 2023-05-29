import app from "../../app";

app.service("potionsService", function PotionsService(potions, potion, resourcesService, gameLoop, heroList, messageService) {
  var $srvc = this;
  this.create = function (itemID) {
    if (itemID == -1) {
      if (
        potion.count + potion.working <
        potion.maxCount
      ) {
        if (resourcesService.decResources(potion.cost, true)) {
          $("#potionButt").attr("disabled", "disabled");
          potion.working++;
          createPotion(true, 0);
        } else {
          messageService.showMessage("You do not have enough Resources.");
        }
      }
    } else {
      var acc = potions[itemID];
      if (
        acc.count + acc.working <
        acc.maxCount
      ) {
        if (resourcesService.decResources(acc.cost, true)) {
          $("#a" + itemID).attr("disabled", "disabled");
          acc.working++;
          createPotions(itemID, true, 0);
        } else {
          messageService.showMessage("You do not have enough Resources.");
        }
      }
    }
  };

  function createPotion(button, start, heroID) {
    if (heroID != 0) {
      heroID = heroID || -1;
    }

    if (potion.prodTime > start) {
      if (button) {
        potion.progress = (potion.prodTime - start)
          .toString()
          .toHHMMSS();
      } else if (heroID >= 0) {
        heroList[heroID].progress = (potion.prodTime - start)
          .toString()
          .toHHMMSS();
      }
      setTimeout(function () {
        createPotion(button, start + 1, heroID);
      }, gameLoop);
    } else {
      potion.working--;
      potion.count++;
      if (button) {
        potion.progress = "Create Potion";
        $("#potionButt").removeAttr("disabled");
      } else if (heroID >= 0) {
        heroList[heroID].progress = "Idle";
      }
    }
  }

  function createPotions(potionID, button, start, heroID) {
    if (heroID != 0) {
      heroID = heroID || -1;
    }
    var acc = potions[potionID];
    if (acc.prodTime > start) {
      if (button) {
        acc.progress = (acc.prodTime - start).toString().toHHMMSS();
      } else if (heroID >= 0) {
        heroList[heroID].progress = (acc.prodTime - start)
          .toString()
          .toHHMMSS();
      }
      setTimeout(function () {
        createPotions(potionID, button, start + 1, heroID);
      }, $srvc.gameLoop);
    } else {
      acc.count++;
      acc.working--;
      if (button) {
        acc.progress = "Create " + acc.name;
        $("#a" + potionID).removeAttr("disabled");
      } else if (heroID >= 0) {
        heroList[heroID].progress = "Idle";
      }
    }
  }
});
