/**
 * Google Analytics initialization.
 * Keeps index.html structure-only by moving the GA snippet here.
 */
(function () {
  const gaId = 'UA-2206167-3';
  type GaWindow = Window & typeof globalThis & Record<string, unknown>;
  (function (i: GaWindow, s: Document, o: string, g: string, r: string) {
    i['GoogleAnalyticsObject'] = r;
    i[r] =
      i[r] ||
      function () {
        ((i[r] as Record<string, unknown[]>).q =
          (i[r] as Record<string, unknown[]>).q || []).push(arguments);
      };
    (i[r] as Record<string, unknown>).l = 1 * +new Date();
    const a = s.createElement(o) as HTMLScriptElement;
    const m = s.getElementsByTagName(o)[0];
    a.async = true;
    a.src = g;
    m?.parentNode?.insertBefore(a, m);
  })(window as GaWindow, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

  (window as GaWindow)['ga']?.('create', gaId, 'auto');
  (window as GaWindow)['ga']?.('send', 'pageview');
})();
