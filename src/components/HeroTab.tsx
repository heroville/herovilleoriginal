/**
 * Hero tab: adventure hero list (card + table views), workers list with job change.
 * E2E expects #heroList with hero name, "Class: ...", progress bars, images, and data-testid="hero-equip-popover-trigger".
 */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.tsx';
import { selectFullState } from '../store/index.ts';
import {
  filterHeroAdventure,
  filterHeroWorker,
  filterHeroBattle,
} from '../services/heroFilters.ts';
import { orderBy } from '../services/util.service.ts';

export default function HeroTab() {
  const game = useGame();
  const state = useSelector(selectFullState);
  const [reverse, setReverse] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedJobByWorker, setSelectedJobByWorker] = useState<Record<number, number>>({});

  const heroList = state.heroList || [];
  const jobs = (state.jobs || []).filter((j) => j.enabled === true);
  const sortHero = (typeof state.sorting?.heroTable === 'string' ? state.sorting.heroTable : null) ?? 'name';
  const sortWork = (typeof state.sorting?.heroWork === 'string' ? state.sorting.heroWork : null) ?? 'job.id';
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

  const setSort = (key: string | string[]) => {
    const same =
      (Array.isArray(sortHero) && Array.isArray(key) && sortHero.join() === key.join()) ||
      sortHero === key;
    setReverse(same ? !reverse : false);
    game.setSortHero?.(key);
  };
  return (
    <section data-testid="hero-tab" className="hv-content hv-content--heroes">
      <div className="hv-hero-layout">
        <div>
          <div
            className="hv-flex hv-flex-wrap hv-items-center hv-gap-2 hv-mb-2"
            role="group"
            aria-label="Sort and filter heroes"
          >
            <span className="hv-text-muted">Sort / filter heroes:</span>
            <div className="hero-sort-wrap" id="heroFilter">
              <button
                type="button"
                className="hv-sort-btn"
                id="sortButton"
                onClick={() => setSortOpen((o) => !o)}
                aria-expanded={sortOpen}
                aria-haspopup="listbox"
              >
                Sort{' '}
                <span className="hv-sort-caret" aria-hidden>
                  ▼
                </span>
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
                    ['dungeon', 'Location'],
                  ].map(([key, label]) => (
                    <li key={String(key)} role="option">
                      <button
                        type="button"
                        className="hero-sort-item"
                        onClick={() => {
                          setSort(key);
                          setSortOpen(false);
                        }}
                      >
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
            <ul id="heroList" data-testid="hero-list" className="hv-hero-list">
              {adventureHeroes.map((hero) => {
                const hpPct = hero.health
                  ? (Number(hero.currHealth) / Number(hero.health)) * 100
                  : 0;
                const xpPct = hero.next ? (Number(hero.experience) / Number(hero.next)) * 100 : 0;
                const weapon = hero.equip?.weapon;
                const heroBattles = filterHeroBattle(battles, hero);
                return (
                  <li key={hero.id} className="hv-hero-card-wrap">
                    <article className="hv-panel hv-hero-card">
                      <div className="hv-hero-card-header">
                        <span className="hv-hero-name">
                          Lvl. {hero.level} {hero.name}
                        </span>
                        <span className="hv-hero-class">Class: {hero.academy?.name ?? '—'}</span>
                      </div>
                      <div className="hv-hero-bars">
                        <div className="hv-hero-bar-row">
                          <span className="hv-hero-bar-label">HP</span>
                          <div
                            className="hv-progress-wrap hv-hero-progress"
                            role="progressbar"
                            aria-valuenow={hero.currHealth}
                            aria-valuemin={0}
                            aria-valuemax={hero.health}
                          >
                            <div className="progress h-100">
                              <div
                                className={`progress-bar progress-bar-hp${hpPct <= 25 ? ' low' : ''}`}
                                style={{ width: `${hpPct}%` }}
                              />
                            </div>
                            <span className="hv-progress-label">
                              {Number(hero.currHealth).toLocaleString()}/
                              {Number(hero.health).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="hv-hero-bar-row">
                          <span className="hv-hero-bar-label">XP</span>
                          <div
                            className="hv-progress-wrap hv-hero-progress"
                            role="progressbar"
                            aria-valuenow={hero.experience}
                            aria-valuemin={0}
                            aria-valuemax={hero.next}
                          >
                            <div className="progress h-100">
                              <div
                                className="progress-bar progress-bar-xp"
                                style={{ width: `${xpPct}%` }}
                              />
                            </div>
                            <span className="hv-progress-label">
                              {Number(hero.experience).toLocaleString()}/
                              {Number(hero.next).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="hv-hero-loot-equip">
                        <div className="hv-hero-loot">
                          <span className="hv-hero-loot-label">Loot:</span>
                          <span>
                            {hero.equip?.gold ?? 0}{' '}
                            <img
                              src="images/I_GoldBar.png"
                              alt="Gold"
                              className="hv-hero-inline-icon"
                            />
                          </span>
                        </div>
                        <div className="hv-hero-equip" data-testid="hero-equip-popover-trigger">
                          <span className="hv-hero-equip-label">Equip:</span>
                          {weapon ? (
                            <span className="hv-hero-equip-main">
                              <img
                                src={`images/${weapon.image}`}
                                alt=""
                                className="hv-hero-equip-icon"
                              />
                              <span className="hv-hero-equip-name">{weapon.name}</span>
                              <span className="hv-hero-equip-stats">
                                ({weapon.minDamage}-{weapon.maxDamage}) Durability:{' '}
                                {weapon.durability}
                              </span>
                            </span>
                          ) : (
                            <span className="hv-hero-equip-empty">—</span>
                          )}
                        </div>
                      </div>
                      <div className="hv-hero-meta">
                        <span className="hv-hero-location">Location: {hero.location}</span>
                        <span className="hv-hero-progress-text">{hero.progress}</span>
                      </div>
                      <div className="hv-hero-combat">
                        <div className="hv-hero-combat-title">Current combat</div>
                        {heroBattles.length === 0 ? (
                          <div className="hv-hero-combat-empty">Not in battle</div>
                        ) : (
                          heroBattles.map((battle, bi) =>
                            (battle.copyMonsters || []).map((monster, mi) => (
                              <div
                                key={`${bi}-${mi}`}
                                className="hv-hero-combat-monster"
                                id="monsterList"
                              >
                                <span className="hv-hero-combat-monster-name">
                                  {monster.name} ({monster.minDamage}-{monster.maxDamage})
                                </span>
                                <div
                                  className="progress"
                                  style={{ width: '100%', maxWidth: 220 }}
                                  role="progressbar"
                                  aria-valuenow={monster.health}
                                  aria-valuemin={0}
                                  aria-valuemax={monster.maxHealth}
                                >
                                  <div
                                    className="progress-bar progress-bar-danger"
                                    style={{
                                      width: `${(monster.health / (monster.maxHealth ?? monster.health)) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="hv-hero-combat-monster-hp">
                                  {monster.health}/{monster.maxHealth ?? monster.health}
                                </span>
                              </div>
                            ))
                          )
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
          {showTable && (
            <table id="oldheroTable" className="hv-table">
              <tbody>
                <tr>
                  <td>
                    <u>
                      <b>Heroes</b>
                    </u>
                  </td>
                </tr>
                <tr>
                  <td>
                    <u>Name</u>
                  </td>
                  <td>
                    <u>Level</u>
                  </td>
                  <td>
                    <u>Loot</u>
                  </td>
                  <td>
                    <u>Damage</u>
                  </td>
                  <td>
                    <u>Health</u>
                  </td>
                  <td>
                    <u>Experience</u>
                  </td>
                  <td>
                    <u>Location</u>
                  </td>
                  <td>
                    <u>Progress</u>
                  </td>
                </tr>
                {adventureHeroes.map((hero) => (
                  <tr key={hero.id}>
                    <td>{hero.name}</td>
                    <td>{hero.level}</td>
                    <td>
                      {hero.equip?.scrap ?? 0} <img src="images/I_Chest01.png" alt="" />{' '}
                      {hero.equip?.gold ?? 0} <img src="images/I_GoldBar.png" alt="" />
                    </td>
                    <td>
                      {hero.equip?.weapon && (
                        <>
                          <img src={`images/${hero.equip.weapon.image}`} alt="" />{' '}
                        </>
                      )}
                      DMG: ({hero.equip?.weapon?.minDamage ?? 0}-
                      {hero.equip?.weapon?.maxDamage ?? 0}) DUR:{' '}
                      {hero.equip?.weapon?.durability ?? 0}
                    </td>
                    <td>
                      {Number(hero.currHealth).toLocaleString()}/
                      {Number(hero.health).toLocaleString()}
                    </td>
                    <td>
                      {Number(hero.experience).toLocaleString()}/{hero.next}
                    </td>
                    <td>{hero.location}</td>
                    <td>{hero.progress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {workers.length > 0 && <div>
          <div className="hv-panel hv-table-card">
            <div className="hv-panel__body hv-panel__body--no-pad">
              <table className="hv-table">
                <tbody>
                  <tr>
                    <td>
                      <u>
                        <b>Workers</b>
                      </u>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <u>Name</u>
                    </td>
                    <td>
                      <u>Level</u>
                    </td>
                    <td>
                      <u>Location</u>
                    </td>
                    <td>
                      <u>Progress</u>
                    </td>
                    <td>
                      <u>Job</u>
                    </td>
                  </tr>
                  {workers.map((heroWork) => {
                    const jobId =
                      selectedJobByWorker[heroWork.id] ?? heroWork.job?.id ?? jobs[0]?.id;
                    return (
                      <tr key={heroWork.id}>
                        <td>{heroWork.name}</td>
                        <td>
                          {heroWork.level} ({heroWork.experience}/{heroWork.next})
                        </td>
                        <td>
                          {heroWork.location} - {heroWork.job?.name}
                        </td>
                        <td>{heroWork.progress}</td>
                        <td>
                          <select
                            className="span17"
                            value={jobId}
                            onChange={(e) =>
                              setSelectedJobByWorker((s) => ({
                                ...s,
                                [heroWork.id]: Number(e.target.value),
                              }))
                            }
                          >
                            {jobs.map((job) => (
                              <option key={job.id} value={job.id}>
                                {job.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => game.hero.heroProfession(jobId, heroWork.id)}
                          >
                            Change
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>}
      </div>
    </section>
  );
}
