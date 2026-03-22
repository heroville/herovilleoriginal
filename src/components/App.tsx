/**
 * Root app: sidebar + viewport; dark mode only. Town first; Guide in corner.
 * E2E expects #gameTabs, role="tab", #town-react-root, #upgradeList (in Upgrades tab), etc.
 */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.tsx';
import { selectFullState } from '../store/index.ts';
import Sidebar from './Sidebar.tsx';
import TopBar from './TopBar.tsx';
import GuidePanel from './GuidePanel.tsx';
import RandomEventSlider from './RandomEventSlider.tsx';
import TownTab from './TownTab.tsx';
import HeroTab from './HeroTab.tsx';
import ProductionTab from './ProductionTab.tsx';
import ProfessionsTab from './ProfessionsTab.tsx';
import BestiaryTab from './BestiaryTab.tsx';
import UpgradesTab from './UpgradesTab.tsx';
import OptionsTab from './OptionsTab.tsx';
import AppDialogs from './AppDialogs.tsx';

function DarkThemeOnly() {
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    return () => document.documentElement.removeAttribute('data-bs-theme');
  }, []);
  return null;
}

export default function App() {
  const game = useGame();
  const state = useSelector(selectFullState);
  const heroEnabled = !!state.heroEnabled;
  const upgradesUnlocked =
    (state.gold ?? 0) >= 1 || (state.upgrades || []).some((u) => u.purchased === true);
  const [activeSection, setActiveSection] = useState('town');

  useEffect(() => {
    if ((import.meta.env.DEV || import.meta.env.VITE_E2E) && typeof window !== 'undefined' && window.__HEROVILLE_E2E_FAST_TICK__ != null) {
      window.__HEROVILLE_E2E_STATE__ = () => game.getState();
      return () => {
        delete window.__HEROVILLE_E2E_STATE__;
      };
    }
  }, [game]);

  useEffect(() => {
    if (activeSection === 'hero' && !heroEnabled) setActiveSection('town');
  }, [heroEnabled, activeSection]);
  useEffect(() => {
    if (activeSection === 'upgrades' && !upgradesUnlocked) setActiveSection('town');
  }, [upgradesUnlocked, activeSection]);

  return (
    <>
      <DarkThemeOnly />
      <div className="hv-app">
        <Sidebar activeSection={activeSection} onSelectSection={setActiveSection} />
        <div className="hv-viewport">
          <TopBar />
          <div className="hv-viewport__body">
            <main className="hv-main">
              {activeSection === 'town' && (
                <div className="hv-content" role="tabpanel" id="town-react-root">
                  <TownTab />
                </div>
              )}
              {activeSection === 'hero' && (
                <div className="hv-content hv-content--heroes" role="tabpanel" id="hero-react-root">
                  <HeroTab />
                </div>
              )}
              {activeSection === 'production' && (
                <div className="hv-content" role="tabpanel" id="production-react-root">
                  <ProductionTab />
                </div>
              )}
              {activeSection === 'professions' && (
                <div className="hv-content" role="tabpanel" id="professions-react-root">
                  <ProfessionsTab />
                </div>
              )}
              {activeSection === 'bestiary' && (
                <div className="hv-content" role="tabpanel" id="bestiary-react-root">
                  <BestiaryTab />
                </div>
              )}
              {activeSection === 'upgrades' && (
                <div className="hv-content" role="tabpanel" id="upgrades-react-root">
                  <UpgradesTab />
                </div>
              )}
              {activeSection === 'options' && (
                <div className="hv-content" role="tabpanel" id="options-react-root">
                  <OptionsTab />
                </div>
              )}
            </main>
            <GuidePanel />
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
    </>
  );
}
