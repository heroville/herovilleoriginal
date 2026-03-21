/**
 * Tutorial and game log panel. Uses Redux tutorial state; Next button dispatches advanceTutorial.
 * E2E expects #panelList, #infobutton, #infoButtonDiv.
 */
import { useSelector, useDispatch } from 'react-redux';
import { advanceTutorial } from '../store/slices/tutorialSlice.js';
import { TUTORIAL_STEPS } from '../constants/tutorialSteps.js';

export default function GuidePanel() {
  const dispatch = useDispatch();
  const { tutorialStepIndex, tutorialCompleted, gameLog } = useSelector((state) => state.tutorial);

  const step = TUTORIAL_STEPS[tutorialStepIndex];
  const showTutorial = !tutorialCompleted && step;
  const showNext = showTutorial && step.showNext;
  const content = showTutorial ? step.text : '';
  const lines = tutorialCompleted ? gameLog : content ? [content] : [];

  return (
    <div className="hv-guide-panel" id="guide-panel">
      <div className="hv-guide-panel__header">{tutorialCompleted ? 'Log' : 'Guide'}</div>
      <ul id="panelList" className="hv-guide-panel__list">
        {lines.length === 0 && <li>No messages yet.</li>}
        {lines.map((line, i) => (
          <li key={`line-${i}-${String(line).slice(0, 20)}`}>{line}</li>
        ))}
      </ul>
      {showNext && (
        <div id="infoButtonDiv" className="hv-guide-panel__actions">
          <button
            type="button"
            id="infobutton"
            className="hv-guide-panel__next"
            data-testid="tutorial-next"
            onClick={() => dispatch(advanceTutorial())}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
