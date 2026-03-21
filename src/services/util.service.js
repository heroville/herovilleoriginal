/**
 * Pure helpers: no scope. Used for filters and checks.
 */

/** Format a number of seconds as HH:MM:SS. */
export function formatSeconds(totalSeconds) {
  const sec = Math.floor(totalSeconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  return pad(h) + ':' + pad(m) + ':' + pad(s);
}

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
