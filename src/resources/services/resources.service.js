import app from "../../app";

app.service("resourcesService", function ResourcesService(resources) {

  this.incResources = function (value = resources.default) {
    let addedResources = value * resources.multiplier;
    if (addedResources + resources.current < resources.max) {
      resources.current += addedResources;
    } else {
      resources.current = resources.max;
    }
  };

  this.decResources = function canSpendResources(value, subtract = false) {
    if (value > resources.current) {
      return false;
    }       
    if (subtract) {
      resources.current -= value;
    }       
    return true;
  }

  this.incResourcesIncr = function (value) {
    resources.default += value;
  };

  this.incResourcesIncrMulti = function (multiplier) {
    resources.default *= multiplier;
  };
});
