import { useState, useEffect } from 'react';

// The auth and dashboard screens are drawn for a 1440px wide desktop frame. On desktop the whole
// screen is zoomed to fit the viewport so proportions stay identical on larger
// displays; below DESKTOP_MIN the layout reflows instead of scaling.
const DESIGN_WIDTH = 1440;
const MIN_CONTENT_HEIGHT = 800;
const DESKTOP_MIN = 1024;
const MIN_SCALE = 0.6;
const MAX_SCALE = 2;

function measure() {
  const { innerWidth: w, innerHeight: h } = window;
  if (w < DESKTOP_MIN) return { isDesktop: false, scale: 1, width: w, height: h };
  const fit = Math.min(w / DESIGN_WIDTH, h / MIN_CONTENT_HEIGHT);
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, fit));
  return { isDesktop: true, scale, width: w / scale, height: h / scale };
}

export default function useDesignScale() {
  const [state, setState] = useState(measure);

  useEffect(() => {
    const onResize = () => setState(measure());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return state;
}
