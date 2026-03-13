/**
 * Sidebar nav: Town first, then Heroes, Production, etc.; Upgrades and Options. Version 2.0 at bottom.
 * E2E expects #gameTabs, role="tab" with names.
 */
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';

const SECTIONS = [
  { id: 'town', name: 'Town' },
  { id: 'hero', name: 'Heroes', disabledKey: 'heroEnabled' },
  { id: 'production', name: 'Production', disabledKey: 'prodEnabled' },
  { id: 'professions', name: 'Professions', disabledKey: 'upgEnabled' },
  { id: 'bestiary', name: 'Bestiary', disabledKey: 'beastEnabled' },
  { id: 'upgrades', name: 'Upgrades' },
  { id: 'options', name: 'Options/Help' },
];

export default function Sidebar({ activeSection, onSelectSection }) {
  const game = useGame();
  const state = useSelector(selectFullState);

  const isDisabled = (section) => {
    if (!section.disabledKey) return false;
    return !state[section.disabledKey];
  };

  const version = state.version ?? '2.0';

  return (
    <aside className="hv-sidebar" id="gameTabs" data-testid="game-tabs" role="tablist">
      <div className="hv-sidebar__brand">
        <img src="images/heroville-logo.png" alt="HeroVille" className="hv-sidebar__logo" />
      </div>

      <nav className="hv-sidebar__nav">
        {SECTIONS.map((section) => {
          const disabled = isDisabled(section);
          const isActive = activeSection === section.id;
          return (
            <a
              key={section.id}
              href={'#' + section.id}
              role="tab"
              aria-selected={isActive}
              aria-disabled={disabled}
              tabIndex={disabled ? -1 : 0}
              className={`hv-sidebar__link ${isActive ? 'hv-sidebar__link--active' : ''} ${disabled ? 'hv-sidebar__link--disabled' : ''}`}
              data-testid={`tab-${section.id}`}
              onClick={(e) => { e.preventDefault(); if (!disabled) onSelectSection(section.id); }}
              onKeyDown={(e) => { if (disabled) return; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectSection(section.id); } }}
              title={disabled ? `${section.name} (unlock by progressing)` : undefined}
            >
              {section.name}
            </a>
          );
        })}
        <div
          className="hv-sidebar__version"
          role="button"
          tabIndex={0}
          onClick={() => game.showVersion?.()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); game.showVersion?.(); } }}
          title="Version information and patch notes"
        >
          Version {version} · Meredori © 2017
        </div>
      </nav>
    </aside>
  );
}
