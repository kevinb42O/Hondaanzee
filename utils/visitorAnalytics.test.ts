import { describe, it, expect } from 'vitest';
import { siteVisitorRows, visitorTotal, visitorSeries, visitorCsv, type VisitorReport } from './visitorAnalytics.ts';
const report: VisitorReport = { method: 'daily_estimate', startedAt: '2026-10-02T18:30:00Z', rows: [
 { day: '2026-10-02', hour: '2026-10-02T18:00:00Z', path: '@site', referrer: 'google', device: 'mobile', count: 3 },
 { day: '2026-10-02', hour: '2026-10-02T18:00:00Z', path: '/', referrer: 'google', device: 'mobile', count: 3 },
 { day: '2026-10-02', hour: '2026-10-02T18:00:00Z', path: '/agenda', referrer: 'direct', device: 'mobile', count: 2 },
 { day: '2026-10-03', hour: '2026-10-03T09:00:00Z', path: '@site', referrer: 'direct', device: 'mobile', count: 2 },
] };
describe('daily visitor estimates', () => {
 it('uses site-wide deduplication instead of adding page uniques', () => { expect(visitorTotal(report)).toBe(5); expect(siteVisitorRows(report)).toHaveLength(2); });
 it('shows unknown history and a partial first day, including Brussels date boundaries', () => {
  const series = visitorSeries(report, 7, '2026-10-03');
  expect(series.slice(0, 5).every(point => point.value === null)).toBe(true);
  expect(series.slice(-2).map(point => point.value)).toEqual([3, 2]);
  expect(series.slice(-2).every(point => point.partial)).toBe(true);
  const midnight = visitorSeries({ ...report, startedAt: '2026-10-01T22:10:00Z' }, 2, '2026-10-02');
  expect(midnight[0].value).toBeNull(); expect(midnight[1].value).toBe(3);
 });
 it('attributes daily visitors to their first hour with no fabricated history', () => {
  const window = { start: '2026-10-01T20:00:00Z', end: '2026-10-02T19:00:00Z', now: '2026-10-02T19:15:00Z', startedAt: '2026-10-02T18:00:00Z' };
  const series = visitorSeries(report, 1, '2026-10-02', window);
  expect(series.slice(0, 22).every(point => point.value === null)).toBe(true);
  expect(series[22]).toMatchObject({ value: 3, partial: true, details: [] }); expect(series[23]).toMatchObject({ value: 0, partial: true });
  expect(visitorSeries(undefined, 1, '2026-10-02', window).every(point => point.value === null)).toBe(true);
 });
 it('exports scope, method and coverage without disguising page counts as website totals', () => {
  const csv = visitorCsv(report, true); expect(csv).toContain('Uur (UTC)'); expect(csv).toContain('Hele website'); expect(csv).toContain('Per pagina'); expect(csv).toContain('opnieuw geteld op andere dag'); expect(csv).toContain(report.startedAt); expect(csv).not.toContain('@site');
 });
});
