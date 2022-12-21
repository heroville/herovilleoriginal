import app from "../../app";
import template from "./heroNameModal.html";

app.component("heroNameModal", {
  template: template,
  controller: HeroNameModalController,
});


function HeroNameModalController($scope, $mdDialog, messageService, heroesService,heroList) {
    this.save = function () {
        for (var i = 0; i < heroList.length; i++) {
          if (!heroesService.validHeroName(this.heroName)) {
            messageService.showMessage("A hero with this name already exists.");
            $scope.heroNameForm.$setValidity('invalid', false)
            return;
          }
        }
        $mdDialog.hide(this.heroName);        
    };    
    this.cancel = function () {

        $mdDialog.cancel();
    };
    this.heroName = heroesService.newHeroName();



}
