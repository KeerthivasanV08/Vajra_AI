/**
 * The bar is intentionally segmented by policy zone. Keep every visual
 * measurement derived from this one definition so marker and zone edges can
 * never diverge.
 */
export const SOP_ZONES = [
  { label: 'MONITOR', start: 0, end: 0.5, color: 'bg-slate-600' },
  { label: 'SOFT-ALERT', start: 0.5, end: 0.7, color: 'bg-amber-500' },
  { label: 'RECOMMEND-HOLD', start: 0.7, end: 0.85, color: 'bg-orange-500' },
  { label: 'ESCALATE-FREEZE', start: 0.85, end: 1, color: 'bg-rose-600' },
] as const;

/** Maps a score through the same piecewise zone geometry used by the bar. */
export function scoreToThresholdPosition(score: number): number {
  const bounded = Math.min(1, Math.max(0, score));
  const zone = SOP_ZONES.find((item) => bounded <= item.end) ?? SOP_ZONES[SOP_ZONES.length - 1];
  const priorWidth = SOP_ZONES
    .filter((item) => item.end <= zone.start)
    .reduce((total, item) => total + (item.end - item.start), 0);
  const fractionOfZone = (bounded - zone.start) / (zone.end - zone.start);
  return (priorWidth + fractionOfZone * (zone.end - zone.start)) * 100;
}

export function thresholdZoneWidth(start: number, end: number): number {
  return scoreToThresholdPosition(end) - scoreToThresholdPosition(start);
}

// Regression invariant: 0.55 must land inside—not on an edge of—the amber band.
export const softAlertMarkerRegressionPasses = (() => {
  const marker = scoreToThresholdPosition(0.55);
  return marker > scoreToThresholdPosition(0.5) && marker < scoreToThresholdPosition(0.7);
})();
