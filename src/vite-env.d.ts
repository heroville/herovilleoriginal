/// <reference types="vite/client" />

interface Window {
  __HEROVILLE_E2E_FAST_TICK__?: number;
  __HEROVILLE_E2E_STATE__?: () => unknown;
  ga?: (...args: unknown[]) => void;
  GoogleAnalyticsObject?: string;
}
