import app from "../../app";
import template from "./weaponTable.html";

app.component("weaponTable", {
  template: template,
  controller: function WeaponTableController(weapons, weaponsService) {
    this.weapons = weapons;
    this.purchaseWeapon = function (weapon) {
        weaponsService.purchaseWeapon(weapon);
    }
  }
});