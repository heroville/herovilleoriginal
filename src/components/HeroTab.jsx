/**
 * Hero tab: adventure hero list (card + table views), workers list with job change.
 * E2E expects #heroList with hero name, "Class: ...", progress bars, images, and popover triggers.
 */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';
import { filterHeroAdventure, filterHeroWorker, filterHeroBattle } from '../services/heroFilters.js';

function getByPath(obj, path) {
  if (obj == null) return undefined;
  const keys = Array.isArray(path) ? path : String(path).split('.');
  let v = obj;
  for (const k of keys) v = v?.[k];
  return v;
}

function orderBy(list, sortKey, reverse) {
  const keys = Array.isArray(sortKey) ? sortKey : [sortKey];
  const arr = [...list];
  arr.sort((a, b) => {
    for (const key of keys) {
      const va = getByPath(a, key);
      const vb = getByPath(b, key);
      if (va !== vb) {
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return reverse ? -cmp : cmp;
      }
    }
    return 0;
  });
  return arr;
}

export default function HeroTab() {
  const game = useGame();
  const state = useSelector(selectFullState);
  const [reverse, setReverse] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedJobByWorker, setSelectedJobByWorker] = useState({});
  const [hoveredPopover, setHoveredPopover] = useState(null);

  const heroList = state.heroList || [];
  const jobs = (state.jobs || []).filter((j) => j.enabled === true);
  const sortHero = state.sorting?.heroTable ?? 'name';
  const sortWork = state.sorting?.heroWork ?? 'job.id';
  const filterName = (state.hFilterString?.name ?? '').trim().toLowerCase();
  const showTable = !!state.showHeroTable?.enabled;

  const adventureHeroes = orderBy(
    filterHeroAdventure(heroList).filter(
      (h) => !filterName || (h.name && String(h.name).toLowerCase().includes(filterName))
    ),
    sortHero,
    reverse
  );
  const workers = orderBy(filterHeroWorker(heroList), sortWork, reverse);
  const battles = state.battles || [];

  const setSort = (key) => {
    const same = (Array.isArray(sortHero) && Array.isArray(key) && sortHero.join() === key.join()) || sortHero === key;
    setReverse(same ? !reverse : false);
    game.setSortHero?.(key);
  };
  const setSortWork = () => setReverse((r) => !r);

  return (
    <section data-testid="hero-tab" className="row justify-content-center">
      <div className="col-lg-7">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2" role="group" aria-label="Sort and filter heroes">
          <span className="small text-muted">Sort / filter heroes:</span>
          <div className="hero-sort-wrap" id="heroFilter">
          <button
            type="button"
            className="hv-sort-btn"
            id="sortButton"
            onClick={() => setSortOpen((o) => !o)}
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
          >
            Sort <span className="hv-sort-caret" aria-hidden>▼</span>
          </button>
          {sortOpen && (
            <ul className="hero-sort-dropdown" role="listbox" aria-label="Sort by">
              {[
                ['name', 'Name'],
                [['level', 'experience'], 'Level'],
                ['equip.gold', 'Gold'],
                ['equip.scrap', 'Resources'],
                ['equip.weapon.id', 'Weapon'],
                ['equip.accessory.length', 'Accessory'],
                ['currHealth', 'Health'],
                ['experience', 'Experience'],
                ['dungeon', 'Location']
              ].map(([key, label]) => (
                <li key={String(key)} role="option">
                  <button type="button" className="hero-sort-item" onClick={() => { setSort(key); setSortOpen(false); }}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          )}
          </div>
        <input
          type="text"
          value={state.hFilterString?.name ?? ''}
          onChange={(e) => game.setFilterName?.(e.target.value)}
          placeholder="Filter by name"
          title="Filter hero list by name"
        />
        </div>
        {!showTable && (
          <ul id="heroList">
            {adventureHeroes.map((hero) => {
              const hpPct = hero.health ? (Number(hero.currHealth) / Number(hero.health)) * 100 : 0;
              const xpPct = hero.next ? (Number(hero.experience) / Number(hero.next)) * 100 : 0;
              const weapon = hero.equip?.weapon;
              const showEquip = hoveredPopover?.heroId === hero.id && hoveredPopover?.type === 'equip';
              const showBattle = hoveredPopover?.heroId === hero.id && hoveredPopover?.type === 'battle';
              const heroBattles = filterHeroBattle(battles, hero);
              return (
                <li key={hero.id}>
                  <table className="table table-bordered" id="heroTable">
                    <tbody>
                      <tr>
                        <td>Lvl. {hero.level} {hero.name}</td>
                      </tr>
                      <tr>
                        <td>Class: {hero.academy?.name ?? '—'}</td>
                      </tr>
                      <tr>
                        <td>
                          HP:{' '}
                          <div className="hv-progress-wrap" style={{ width: 220 }} role="progressbar" aria-valuenow={hero.currHealth} aria-valuemin={0} aria-valuemax={hero.health}>
                            <div className="progress h-100">
                              <div className={`progress-bar progress-bar-hp${hpPct <= 25 ? ' low' : ''}`} style={{ width: `${hpPct}%` }} />
                            </div>
                            <span className="hv-progress-label">{Number(hero.currHealth).toLocaleString()}/{Number(hero.health).toLocaleString()}</span>
                          </div>
                          {' '}
                          XP:{' '}
                          <div className="hv-progress-wrap" style={{ width: 220 }} role="progressbar" aria-valuenow={hero.experience} aria-valuemin={0} aria-valuemax={hero.next}>
                            <div className="progress h-100">
                              <div className="progress-bar progress-bar-xp" style={{ width: `${xpPct}%` }} />
                            </div>
                            <span className="hv-progress-label">{Number(hero.experience).toLocaleString()}/{Number(hero.next).toLocaleString()}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table id="lootTable">
                            <tbody>
                              <tr>
                                <td>Loot:</td>
                                <td>Equip:</td>
                              </tr>
                              <tr>
                                <td style={{ width: '50%' }}>
                                  {hero.equip?.gold ?? 0} <img src="images/I_GoldBar.png" alt="Gold" />
                                </td>
                                <td>
                                  <span
                                    data-testid="hero-equip-popover-trigger"
                                    onMouseEnter={() => setHoveredPopover({ heroId: hero.id, type: 'equip' })}
                                    onMouseLeave={() => setHoveredPopover((p) => (p?.type === 'equip' && p?.heroId === hero.id ? null : p))}
                                    style={{ position: 'relative', cursor: 'pointer' }}
                                  >
                                    {weapon && <img src={`images/${weapon.image}`} alt={weapon.name} />}
                                    {' '}({weapon?.minDamage ?? 0}-{weapon?.maxDamage ?? 0}) Durability: {weapon?.durability ?? 0}
                                    {showEquip && (
                                      <div
                                        className="card hero-popover"
                                        style={{ position: 'absolute', left: 0, top: '100%', zIndex: 1050, minWidth: 200, marginTop: 4 }}
                                        onMouseEnter={() => setHoveredPopover({ heroId: hero.id, type: 'equip' })}
                                        onMouseLeave={() => setHoveredPopover(null)}
                                      >
                                        <div className="card-body">
                                          {weapon && <><img src={`images/${weapon.image}`} alt="" /> {weapon.name} ({weapon.minDamage}-{weapon.maxDamage}) {weapon.durability}</>}
                                          {(hero.equip?.accessory || []).map((acc, i) => (
                                            <div key={acc.id ?? acc.name ?? `acc-${hero.id}-${i}`}><img src={`images/${acc.image}`} alt="" /> {acc.name} | {acc.durability}</div>
                                          ))}
                                          {(hero.equip?.potions || []).map((pot, i) => (
                                            <div key={pot.id ?? pot.name ?? `pot-${hero.id}-${i}`}><img src={`images/${pot.image}`} alt="" /> {pot.name} | {pot.count}</div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td>Location: {hero.location}</td>
                      </tr>
                      <tr>
                        <td>
                          <span
                            data-testid="hero-battle-popover-trigger"
                            onMouseEnter={() => setHoveredPopover({ heroId: hero.id, type: 'battle' })}
                            onMouseLeave={() => setHoveredPopover((p) => (p?.type === 'battle' && p?.heroId === hero.id ? null : p))}
                            style={{ position: 'relative', cursor: 'pointer' }}
                          >
                            {hero.progress}
                            {showBattle && (
                              <div
                                className="card hero-popover"
                                style={{ position: 'absolute', left: 0, top: '100%', zIndex: 1050, marginTop: 4 }}
                                onMouseEnter={() => setHoveredPopover({ heroId: hero.id, type: 'battle' })}
                                onMouseLeave={() => setHoveredPopover(null)}
                              >
                                {heroBattles.length > 0 ? (
                                  <table className="table table-bordered">
                                    <tbody>
                                      {heroBattles.map((battle, bi) => (
                                        <tr key={bi}>
                                          <td>
                                            {(battle.copyMonsters || []).map((monster, mi) => (
                                              <div key={mi} id="monsterList">
                                                {monster.name} ({monster.minDamage}-{monster.maxDamage}){' '}
                                                <div className="progress" style={{ width: 200 }} role="progressbar">
                                                  <div className="progress-bar progress-bar-danger" style={{ width: `${(monster.health / monster.maxHealth) * 100}%` }}>
                                                    <i>{monster.health}/{monster.maxHealth}</i>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div>Not in Battle</div>
                                )}
                              </div>
                            )}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </li>
              );
            })}
          </ul>
        )}
        {showTable && (
          <table id="oldheroTable" className="table table-bordered">
            <tbody>
              <tr>
                <td><u><b>Heroes</b></u></td>
              </tr>
              <tr>
                <td><u>Name</u></td>
                <td><u>Level</u></td>
                <td><u>Loot</u></td>
                <td><u>Damage</u></td>
                <td><u>Health</u></td>
                <td><u>Experience</u></td>
                <td><u>Location</u></td>
                <td><u>Progress</u></td>
              </tr>
              {adventureHeroes.map((hero) => (
                <tr key={hero.id}>
                  <td>{hero.name}</td>
                  <td>{hero.level}</td>
                  <td>{hero.equip?.scrap ?? 0} <img src="images/I_Chest01.png" alt="" /> {hero.equip?.gold ?? 0} <img src="images/I_GoldBar.png" alt="" /></td>
                  <td>{hero.equip?.weapon && <><img src={`images/${hero.equip.weapon.image}`} alt="" /> </>}DMG: ({hero.equip?.weapon?.minDamage ?? 0}-{hero.equip?.weapon?.maxDamage ?? 0}) DUR: {hero.equip?.weapon?.durability ?? 0}</td>
                  <td>{Number(hero.currHealth).toLocaleString()}/{Number(hero.health).toLocaleString()}</td>
                  <td>{Number(hero.experience).toLocaleString()}/{hero.next}</td>
                  <td>{hero.location}</td>
                  <td>{hero.progress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="col-lg-5" style={workers.length === 0 ? { display: 'none' } : undefined}>
        <table className="table table-bordered">
          <tbody>
            <tr>
              <td><u><b>Workers</b></u></td>
            </tr>
            <tr>
              <td><u>Name</u></td>
              <td><u>Level</u></td>
              <td><u>Location</u></td>
              <td><u>Progress</u></td>
              <td><u>Job</u></td>
            </tr>
            {workers.map((heroWork) => {
              const jobId = selectedJobByWorker[heroWork.id] ?? heroWork.job?.id ?? jobs[0]?.id;
              return (
                <tr key={heroWork.id}>
                  <td>{heroWork.name}</td>
                  <td>{heroWork.level} ({heroWork.experience}/{heroWork.next})</td>
                  <td>{heroWork.location} - {heroWork.job?.name}</td>
                  <td>{heroWork.progress}</td>
                  <td>
                    <select
                      className="span17"
                      value={jobId}
                      onChange={(e) => setSelectedJobByWorker((s) => ({ ...s, [heroWork.id]: Number(e.target.value) }))}
                    >
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>{job.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button type="button" onClick={() => game.hero.heroProfession(jobId, heroWork.id)}>
                      Change
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
