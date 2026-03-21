/**
 * Pure helpers: no scope. Used for filters and checks.
 */

function UtilServiceFactory() {
  function greaterThan(prop, val) {
    return function (item) {
      return item[prop] > val;
    };
  }

  function meetRequirements(hero, weapon) {
    if (!weapon || !weapon.heroClass || !hero || hero.academy == null) return false;
    for (let i = 0; i < weapon.heroClass.length; i++) {
      if (weapon.heroClass[i] === hero.academy.id) return true;
    }
    return false;
  }

  return {
    greaterThan,
    meetRequirements,
  };
}

export default UtilServiceFactory;
