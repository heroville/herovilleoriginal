/**
 * Pure helpers: no scope. Used for filters and checks.
 */

/**
 * Get a value from an object by a dot-path string or array of keys.
 * e.g. getByPath(obj, 'a.b.c') or getByPath(obj, ['a', 'b', 'c'])
 */
export function getByPath(obj: unknown, path: string | string[]): unknown {
  if (obj == null) return undefined;
  const keys = Array.isArray(path) ? path : String(path).split('.');
  let v: unknown = obj;
  for (const k of keys) v = (v as Record<string, unknown>)?.[k];
  return v;
}

/**
 * Sort a list by one or more keys (dot-path supported). Returns a new array.
 * @param list - array to sort
 * @param sortKey - single key or array of keys for tiebreaking
 * @param reverse - sort descending when true
 */
export function orderBy<T>(list: T[], sortKey: string | string[], reverse = false): T[] {
  if (!sortKey || !Array.isArray(list)) return list;
  const keys = Array.isArray(sortKey) ? sortKey : [sortKey];
  const arr = [...list];
  arr.sort((a, b) => {
    for (const key of keys) {
      const va = getByPath(a, key);
      const vb = getByPath(b, key);
      if (va !== vb) {
        const cmp = (va as number) < (vb as number) ? -1 : (va as number) > (vb as number) ? 1 : 0;
        return reverse ? -cmp : cmp;
      }
    }
    return 0;
  });
  return arr;
}

/** Format a number of seconds as HH:MM:SS. */
export function formatSeconds(totalSeconds: number): string {
  const sec = Math.floor(totalSeconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  return pad(h) + ':' + pad(m) + ':' + pad(s);
}

function UtilServiceFactory() {
  function greaterThan(prop: string, val: number) {
    return function (item: Record<string, number>) {
      return item[prop] > val;
    };
  }

  function meetRequirements(
    hero: { academy?: { id: number } } | null,
    weapon: { heroClass?: Array<number | { id: number }> } | null
  ): boolean {
    if (!weapon || !weapon.heroClass || !hero || hero.academy == null) return false;
    for (let i = 0; i < weapon.heroClass.length; i++) {
      const cls = weapon.heroClass[i];
      const clsId = typeof cls === 'number' ? cls : cls.id;
      if (clsId === hero.academy.id) return true;
    }
    return false;
  }

  return {
    greaterThan,
    meetRequirements,
  };
}

export type UtilServiceInstance = ReturnType<typeof UtilServiceFactory>;

export default UtilServiceFactory;
