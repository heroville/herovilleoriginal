/**
 * Top bar: resources only (no logo). Resources area is left-aligned.
 */
import ResourcesBar from './ResourcesBar.tsx';

export default function TopBar() {
  return (
    <header className="hv-topbar" id="header-react-root">
      <div className="hv-topbar__resources">
        <ResourcesBar />
      </div>
    </header>
  );
}
