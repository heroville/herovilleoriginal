/**
 * Root app: tab bar, tab content, dark theme.
 * E2E expects #gameTabs and getByRole('link', { name: 'Town' }) etc.
 * In E2E mode (window.__HEROVILLE_E2E_FAST_TICK__), exposes window.__HEROVILLE_E2E_STATE__() for tests.
 */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';
import GameHeader from './GameHeader.jsx';
import ResourcesBar from './ResourcesBar.jsx';
import RandomEventSlider from './RandomEventSlider.jsx';
import FooterBar from './FooterBar.jsx';
import TownTab from './TownTab.jsx';
import HeroTab from './HeroTab.jsx';
import ProductionTab from './ProductionTab.jsx';
import ProfessionsTab from './ProfessionsTab.jsx';
import BestiaryTab from './BestiaryTab.jsx';
import OptionsTab from './OptionsTab.jsx';
import AppDialogs from './AppDialogs.jsx';

const TABS = [
  { id: 'town', name: 'Town' },
  { id: 'hero', name: 'Hero', disabledKey: 'heroEnabled' },
  { id: 'production', name: 'Production', disabledKey: 'prodEnabled' },
  { id: 'professions', name: 'Professions', disabledKey: 'upgEnabled' },
  { id: 'bestiary', name: 'Bestiary', disabledKey: 'beastEnabled' },
  { id: 'options', name: 'Options/Help' }
];

function DarkTheme({ dark }) {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
    return () => { html.removeAttribute('data-bs-theme'); };
  }, [dark]);
  return null;
}

export default function App() {
  const game = useGame();
  const [activeTab, setActiveTab] = useState('town');
  const state = useSelector(selectFullState);
  const dark = game.getState?.()?.dark;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__HEROVILLE_E2E_FAST_TICK__ != null) {
      window.__HEROVILLE_E2E_STATE__ = () => game.getState();
      return () => { delete window.__HEROVILLE_E2E_STATE__; };
    }
  }, [game]);

  const isDisabled = (tab) => {
    if (!tab.disabledKey) return false;
    return !state[tab.disabledKey];
  };

  return (
    <>
      <DarkTheme dark={!!dark} />
      <div className="app-main">
        <div className="row" id="header-react-root">
          <GameHeader />
        </div>
        <div id="resources-react-root">
          <ResourcesBar />
        </div>
        <div id="gameTabs" data-testid="game-tabs">
        <ul className="nav nav-tabs" role="tablist">
          {TABS.map((tab) => {
            const disabled = isDisabled(tab);
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id} className="nav-item" role="presentation">
                <a
                  href={'#' + tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-disabled={disabled}
                  tabIndex={disabled ? -1 : 0}
                  className={`nav-link ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                  data-testid={`tab-${tab.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!disabled) setActiveTab(tab.id);
                  }}
                  onKeyDown={(e) => {
                    if (disabled) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveTab(tab.id);
                    }
                  }}
                  title={disabled ? `${tab.name} (unlock by progressing)` : undefined}
                >
                  {tab.name}
                </a>
              </li>
            );
          })}
        </ul>
        <div className="tab-content" style={{ marginTop: 8 }}>
          <div role="tabpanel" id="town-react-root" className={activeTab === 'town' ? 'tab-pane active' : 'tab-pane'}>
            <TownTab />
          </div>
          <div role="tabpanel" id="hero-react-root" className={activeTab === 'hero' ? 'tab-pane active' : 'tab-pane'} hidden={activeTab !== 'hero'}>
            <HeroTab />
          </div>
          <div role="tabpanel" id="production-react-root" className={activeTab === 'production' ? 'tab-pane active' : 'tab-pane'} hidden={activeTab !== 'production'}>
            <ProductionTab />
          </div>
          <div role="tabpanel" id="professions-react-root" className={activeTab === 'professions' ? 'tab-pane active' : 'tab-pane'} hidden={activeTab !== 'professions'}>
            <ProfessionsTab />
          </div>
          <div role="tabpanel" id="bestiary-react-root" className={activeTab === 'bestiary' ? 'tab-pane active' : 'tab-pane'} hidden={activeTab !== 'bestiary'}>
            <BestiaryTab />
          </div>
          <div role="tabpanel" id="options-react-root" className={activeTab === 'options' ? 'tab-pane active' : 'tab-pane'} hidden={activeTab !== 'options'}>
            <OptionsTab />
          </div>
        </div>
      </div>
        <div id="randomTrigger">
          <div id="random-event-react-root">
            <RandomEventSlider />
          </div>
        </div>
        <div id="dialogs-react-root">
          <AppDialogs />
        </div>
      </div>
      <div id="footer-react-root">
        <FooterBar />
      </div>
    </>
  );
}
