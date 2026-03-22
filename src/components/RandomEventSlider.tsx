/**
 * Random event: floating image when state.randomE is set; click applies event and clears it.
 */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.tsx';
import { selectFullState } from '../store/index.ts';
import type { RandomEvent } from '../types/index.ts';

export default function RandomEventSlider() {
  const game = useGame();
  const state = useSelector(selectFullState);
  const [position, setPosition] = useState(() => ({
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
  }));

  useEffect(() => {
    const id = setInterval(() => {
      setPosition({ top: Math.random() * 100 + '%', left: Math.random() * 100 + '%' });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const randomE = state.randomE;
  if (!randomE || typeof randomE === 'string') return null;
  const event = randomE as RandomEvent;

  return (
    <div
      className="random-event-slider"
      style={position}
      role="button"
      tabIndex={0}
      onClick={() => game.randomEvent?.(event.type)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') game.randomEvent?.(event.type);
      }}
    >
      <img src={`images/${event.image}`} alt="" />
    </div>
  );
}
