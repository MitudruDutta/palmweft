/** Expose experimental Canvas, games, Inspect, filters, and the legacy menu only through ?lab=1. */
export function labEnabled(search: string = typeof location === 'undefined' ? '' : location.search): boolean {
  return new URLSearchParams(search).get('lab') === '1';
}
