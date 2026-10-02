import{describe,expect,it}from'vitest';import{hourlySeries}from'./hourlyAnalytics';import{chartDateLabel}from'./analyticsChart';
const window={start:'2026-10-01T20:00:00Z',end:'2026-10-02T19:00:00Z',now:'2026-10-02T19:15:00Z',startedAt:'2026-10-02T18:30:00Z'};
describe('real 24-hour analytics',()=>{
 it('separates unmeasured hours from measured zeroes and partial hours',()=>{
  const points=hourlySeries([{hour:'2026-10-02T18:00:00+00:00',event:'pageview',count:4},{hour:'2026-10-02T18:00:00Z',event:'route',count:2}],window);
  expect(points).toHaveLength(24);expect(points[21].value).toBe(null);expect(points[22].value).toBe(4);expect(points[22].details![0].value).toBe(2);expect(points[22].partialLabel).toContain('gestart');expect(points[23].value).toBe(0);expect(points[23].partialLabel).toBe('lopend uur');
 });
 it('keeps repeated Brussels autumn hours distinct with their UTC offset',()=>{
  const points=hourlySeries([],{start:'2026-10-24T02:00:00Z',end:'2026-10-25T01:00:00Z',now:'2026-10-25T01:30:00Z',startedAt:'2026-10-23T00:00:00Z'});
  expect(points).toHaveLength(24);expect(new Set(points.map(p=>p.day)).size).toBe(24);
  expect(chartDateLabel(points[22])).toContain('02:00');expect(chartDateLabel(points[23])).toContain('02:00');expect(chartDateLabel(points[22])).not.toBe(chartDateLabel(points[23]));
 });
 it('keeps the spring change at 24 real hour buckets with no invented local 02:00',()=>{
  const points=hourlySeries([],{start:'2026-03-28T03:00:00Z',end:'2026-03-29T02:00:00Z',now:'2026-03-29T02:30:00Z',startedAt:'2026-03-27T00:00:00Z'});
  expect(chartDateLabel(points[21],true)).toBe('01:00');expect(chartDateLabel(points[22],true)).toBe('03:00');expect(chartDateLabel(points[23],true)).toBe('04:00');
 });
});
