/**
 * useFocusTrap: traps keyboard focus inside a container while active.
 * Tab cycles through focusable elements; focus is restored to the previously
 * focused element when the trap is deactivated.
 */
import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * @param containerRef - ref to the container element that receives the focus trap
 * @param isActive - trap is active when true
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, isActive: boolean): void {
  const previousFocusRef = useRef<Element | null>(null);
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    previousFocusRef.current = document.activeElement;
    const el = containerRef.current;
    const focusable = el.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = focusable[0];
    if (first && typeof first.focus === 'function') first.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusableList = el.querySelectorAll<HTMLElement>(FOCUSABLE);
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
      const prev = previousFocusRef.current;
      if (prev && typeof (prev as HTMLElement).focus === 'function') {
        (prev as HTMLElement).focus();
      }
    };
  }, [isActive, containerRef]);
}
