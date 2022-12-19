import app from "../../app";
import template from "./heroNameModal.html";

app.component("heroNameModal", {
  template: template,
  controller: HeroNameModalController,
});


function HeroNameModalController($mdDialog, messageService, heroesService,heroList) {
    this.save = function () {
        console.log("save");
        $mdDialog.hide();
        messageService.showMessage("New hero created.")
        heroesService.addHero(this.heroName);
        
    };
    this.cancel = function() {
        // do something when the user clicks Cancel
        $mdDialog.cancel();
      }

    this.newHeroName = function () {
      return "Random";
    };

    this.validHeroName = function (modelValue, viewValue) {
    var hName = modelValue || viewValue;
      if (hName == "" || hName == null) {
        messageService.showMessage("You must enter a valid name for the hero.");
        return false;
      }
      for (var i = 0; i < heroList.length; i++) {
        if (heroList[i].name == hName) {
          messageService.showMessage("A hero with this name already exists.");
          return false;
        }
      }
      return true;
    }

}
