/**
 * Professions tab: Jobs table. E2E expects "Jobs", "Name", "Description".
 */
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';

export default function ProfessionsTab() {
  const game = useGame();
  const state = useSelector(selectFullState);

  const jobs = (state.jobs || []).filter((j) => j.enabled === true);

  return (
    <section data-testid="professions-tab" className="hv-content">
      {jobs.length > 0 && (
        <div className="hv-panel hv-table-card" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="hv-panel__body hv-panel__body--no-pad">
            <table className="hv-table">
              <thead>
                <tr>
                  <th colSpan={2} className="hv-text-center">Jobs</th>
                </tr>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id ?? job.name}>
                    <td>{job.name}</td>
                    <td>{job.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
