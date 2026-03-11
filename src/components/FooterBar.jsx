/**
 * Footer: version link, copyright, social links.
 */
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';

export default function FooterBar() {
  const game = useGame();
  const state = useSelector(selectFullState);

  const version = state.version ?? '';
  const sendGa = (category, label) => {
    if (typeof window !== 'undefined' && typeof window.ga === 'function') {
      window.ga('send', 'event', 'Clicks', category, label);
    }
  };

  return (
    <div className="footer navbar-fixed-bottom">
      <div className="container" id="support">
        <button type="button" className="btn-link" style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => game.showVersion?.()}>Version {version}</button>
        {' Meredori © 2017 '}
        <a id="paypal" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=KWC55P8UFP3AN" target="_blank" rel="noopener noreferrer" onClick={() => sendGa('Paypal')}>
          <img src="images/paypal.png" style={{ width: 35 }} alt="PayPal" />
        </a>
        <a id="reddit" href="http://www.reddit.com/r/heroville/" target="_blank" rel="noopener noreferrer" onClick={() => sendGa('Reddit')}>
          <img src="images/reddit.png" style={{ width: 35 }} alt="Reddit" />
        </a>
        <a id="patreon" href="http://www.patreon.com/meredori" target="_blank" rel="noopener noreferrer" onClick={() => sendGa('Patreon')}>
          <img src="images/patreon.png" style={{ width: 35 }} alt="Patreon" />
        </a>
      </div>
    </div>
  );
}
