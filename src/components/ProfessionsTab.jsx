/**
 * Professions tab: Jobs table (read-only).
 * E2E expects section#container, "Jobs", "Name", "Description".
 */
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';

export default function ProfessionsTab() {
  const game = useGame();
  const state = useSelector(selectFullState);

  const jobs = (state.jobs || []).filter((j) => j.enabled === true);

  return (
    <section data-testid="professions-tab" className="row justify-content-center">
      <div className="col-lg-6 mb-3">
        {jobs.length > 0 && (
          <div className="card h-100">
            <div className="card-body p-2">
          <table className="table table-bordered mb-0">
            <thead>
              <tr>
                <th colSpan={2} className="text-center">Jobs</th>
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
      </div>
      <div className="col-lg-6" />
    </section>
  );
}
