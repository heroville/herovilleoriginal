/**
 * useFocusTrap: traps keyboard focus inside a container while active.
 * Tab cycles through focusable elements; focus is restored to the previously
 * focused element when the trap is deactivated.
 */
import { useEffect, useRef } from 'react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * @param {React.RefObject<HTMLElement>} containerRef
 * @param {boolean} isActive - trap is active when true
 */
export function useFocusTrap(containerRef, isActive) {
  const previousFocusRef = useRef(null);
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    previousFocusRef.current = document.activeElement;
    const el = containerRef.current;
    const focusable = el.querySelectorAll(FOCUSABLE);
    const first = focusable[0];
    if (first && typeof first.focus === 'function') first.focus();
    const handleKey = (e) => {
      if (e.key !== 'Tab') return;
      const focusableList = el.querySelectorAll(FOCUSABLE);
      const firstEl = focusableList[0];
      const lastEl = focusableList[focusableList.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstEl && lastEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl && firstEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    el.addEventListener('keydown', handleKey);
    return () => {
      el.removeEventListener('keydown', handleKey);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, containerRef]);
}
