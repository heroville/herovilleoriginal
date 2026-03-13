/**
 * Root app: sidebar + viewport; dark mode only. Town first; Guide in corner.
 * E2E expects #gameTabs, role="tab", #town-react-root, #upgradeList (in Upgrades tab), etc.
 */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import GuidePanel from './GuidePanel.jsx';
import RandomEventSlider from './RandomEventSlider.jsx';
import TownTab from './TownTab.jsx';
import HeroTab from './HeroTab.jsx';
import ProductionTab from './ProductionTab.jsx';
import ProfessionsTab from './ProfessionsTab.jsx';
import BestiaryTab from './BestiaryTab.jsx';
import UpgradesTab from './UpgradesTab.jsx';
import OptionsTab from './OptionsTab.jsx';
import AppDialogs from './AppDialogs.jsx';

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
  const [activeSection, setActiveSection] = useState('town');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__HEROVILLE_E2E_FAST_TICK__ != null) {
      window.__HEROVILLE_E2E_STATE__ = () => game.getState();
      return () => { delete window.__HEROVILLE_E2E_STATE__; };
    }
  }, [game]);

  useEffect(() => {
    if (activeSection === 'hero' && !heroEnabled) setActiveSection('town');
  }, [heroEnabled, activeSection]);

  return (
    <>
      <DarkThemeOnly />
      <div className="hv-app">
        <Sidebar activeSection={activeSection} onSelectSection={setActiveSection} />
        <div className="hv-viewport">
          <TopBar />
          <div className="hv-viewport__body">
            <main className="hv-main">
              <div className="hv-content" style={{ display: activeSection === 'town' ? 'block' : 'none' }} role="tabpanel" id="town-react-root" aria-hidden={activeSection !== 'town'}>
                <TownTab />
              </div>
              <div className="hv-content hv-content--heroes" style={{ display: activeSection === 'hero' ? 'block' : 'none' }} role="tabpanel" id="hero-react-root" aria-hidden={activeSection !== 'hero'}>
                <HeroTab />
              </div>
              <div className="hv-content" style={{ display: activeSection === 'production' ? 'block' : 'none' }} role="tabpanel" id="production-react-root" aria-hidden={activeSection !== 'production'}>
                <ProductionTab />
              </div>
              <div className="hv-content" style={{ display: activeSection === 'professions' ? 'block' : 'none' }} role="tabpanel" id="professions-react-root" aria-hidden={activeSection !== 'professions'}>
                <ProfessionsTab />
              </div>
              <div className="hv-content" style={{ display: activeSection === 'bestiary' ? 'block' : 'none' }} role="tabpanel" id="bestiary-react-root" aria-hidden={activeSection !== 'bestiary'}>
                <BestiaryTab />
              </div>
              <div className="hv-content" style={{ display: activeSection === 'upgrades' ? 'block' : 'none' }} role="tabpanel" id="upgrades-react-root" aria-hidden={activeSection !== 'upgrades'}>
                <UpgradesTab />
              </div>
              <div className="hv-content" style={{ display: activeSection === 'options' ? 'block' : 'none' }} role="tabpanel" id="options-react-root" aria-hidden={activeSection !== 'options'}>
                <OptionsTab />
              </div>
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
