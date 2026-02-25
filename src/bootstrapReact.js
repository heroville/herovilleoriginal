/**
 * Mounts React tab components after Angular has set window.__HEROVILLE_BRIDGE__.
 * Called from MainController via dynamic import so the bridge is available.
 */
import { createRoot } from 'react-dom/client';
import React from 'react';
import TownTab from './components/TownTab.jsx';

export default function bootstrapReact() {
  const bridge = window.__HEROVILLE_BRIDGE__;
  if (!bridge) return;

  const townRoot = document.getElementById('town-react-root');
  if (townRoot) {
    createRoot(townRoot).render(React.createElement(TownTab, { bridge }));
  }
}
