import { describe, it, expect } from 'vitest';
import { chartAxis, chartScale, chartSegments, chartIndex, chartX } from './analyticsChart.ts';
describe('analytics chart', () => {
  it('keeps missing measurement separate from measured zero', () => expect(chartSegments([{day:'a',value:null},{day:'b',value:0},{day:'c',value:5},{day:'d',value:null},{day:'e',value:2}])).toEqual([[1,2],[4]]));
  it('uses unique integer ticks for very low counts', () => { const scale=chartScale([{day:'a',value:1}]);expect(scale.ticks).toEqual([0,1]);expect(chartScale([{day:'a',value:468}]).ceiling).toBeGreaterThanOrEqual(468); });
  it('clamps scaled pointer selection and handles one day', () => {expect(chartIndex(-100,7)).toBe(0);expect(chartIndex(2000,7)).toBe(6);expect(chartIndex(chartX(3,7),7)).toBe(3);expect(chartIndex(500,1)).toBe(0);});
});

const daysEnding = (length: number, end = '2026-10-02') => Array.from({length}, (_, i) => {
  const day = new Date(`${end}T12:00:00Z`); day.setUTCDate(day.getUTCDate() - length + 1 + i);
  return { day: day.toISOString().slice(0, 10), value: i };
});
describe('calendar axes for every analytics period', () => {
  it('labels every day in the week with its weekday and full range', () => {
    const axis = chartAxis(daysEnding(7));
    expect(axis.mode).toBe('day'); expect(axis.ticks).toHaveLength(7);
    expect(axis.ticks[0].label).toContain('26'); expect(axis.ticks.every(t => t.secondary.length > 0)).toBe(true);
    expect(axis.range).toContain('26 september 2026'); expect(axis.range).toContain('2 oktober 2026');
  });
  it('labels all 30 dates and marks the actual month boundary', () => {
    const axis = chartAxis(daysEnding(30));
    expect(axis.mode).toBe('date'); expect(axis.ticks).toHaveLength(30);
    expect(axis.ticks.map(t => t.label)).toEqual([...Array.from({length:28}, (_,i) => String(i+3)), '1', '2']);
    expect(axis.boundaries.map(t=>t.index)).toEqual([0,28]);
  });
  it('uses calendar weeks for 90 days and includes both precise endpoints', () => {
    const points = daysEnding(90), axis = chartAxis(points);
    expect(axis.mode).toBe('week'); expect(axis.ticks.length).toBeGreaterThanOrEqual(12);
    expect(axis.ticks[0].index).toBe(0); expect(axis.ticks.at(-1)?.index).toBe(89);
    expect(axis.ticks.slice(1,-1).every(t => new Date(points[t.index].day).getUTCDay() === 1)).toBe(true);
    expect(axis.ticks.slice(1).every((t,i) => t.index-axis.ticks[i].index>=5)).toBe(true);
  });
  it('labels every calendar month with its year across the annual range', () => {
    const axis = chartAxis(daysEnding(365));
    expect(axis.mode).toBe('month'); expect(axis.ticks).toHaveLength(13);
    expect(axis.ticks[0].secondary).toBe('2025'); expect(axis.ticks.at(-1)?.secondary).toBe('2026');
    expect(axis.ticks.map(t=>t.label)).toContain('jan');
    expect(axis.range).toContain('3 oktober 2025');
  });
  it('keeps short first months readable and follows leap-year calendar boundaries', () => {
    const points = daysEnding(366,'2024-03-02'), axis = chartAxis(points);
    expect(axis.ticks.every(t => t.index===0 || points[t.index].day.endsWith('-01'))).toBe(true);
    expect(axis.ticks.slice(1).every((t,i) => t.index-axis.ticks[i].index>=12)).toBe(true);
    const shortStart = daysEnding(365,'2026-10-29');
    expect(shortStart[chartAxis(shortStart).ticks[0].index].day).toBe('2025-11-01');
  });
});
