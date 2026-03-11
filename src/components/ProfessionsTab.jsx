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
    <section id="container" data-testid="professions-tab">
      <div className="col-lg-6">
        {jobs.length > 0 && (
          <table className="table table-bordered">
            <tbody>
              <tr>
                <td><u><b>Jobs</b></u></td>
              </tr>
              <tr>
                <td><u>Name</u></td>
                <td><u>Description</u></td>
              </tr>
              {jobs.map((job) => (
                <tr key={job.id ?? job.name}>
                  <td>{job.name}</td>
                  <td>{job.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="col-lg-6" />
    </section>
  );
}
