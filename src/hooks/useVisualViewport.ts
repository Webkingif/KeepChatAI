import { useEffect } from 'react';

/**
 * useVisualViewport
 * Synchronizes CSS custom properties --app-height and --app-width to the actual visual viewport.
 * When a user uses Chrome with tab groups open, Chrome adds a bottom tab strip and top bars.
 * window.visualViewport accurately reports the exact usable screen height between Chrome's UI elements,
 * ensuring the entire website height is always fully visible with zero cut-off content.
 */
export function useVisualViewport() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncViewport = () => {
      const vv = window.visualViewport;
      const height = vv ? vv.height : window.innerHeight;
      const width = vv ? vv.width : window.innerWidth;

      document.documentElement.style.setProperty('--app-height', `${height}px`);
      document.body.style.setProperty('--app-height', `${height}px`);

      document.documentElement.style.setProperty('--app-width', `${width}px`);
      document.body.style.setProperty('--app-width', `${width}px`);
    };

    syncViewport();

    window.addEventListener('resize', syncViewport, { passive: true });
    window.addEventListener('orientationchange', syncViewport, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncViewport, { passive: true });
      window.visualViewport.addEventListener('scroll', syncViewport, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', syncViewport);
      window.removeEventListener('orientationchange', syncViewport);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', syncViewport);
        window.visualViewport.removeEventListener('scroll', syncViewport);
      }
    };
  }, []);
}
