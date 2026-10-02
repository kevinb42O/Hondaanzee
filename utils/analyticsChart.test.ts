import { describe, it, expect } from 'vitest';
import { chartScale, chartSegments, chartIndex, chartX } from './analyticsChart.ts';
describe('analytics chart', () => {
  it('keeps missing measurement separate from measured zero', () => expect(chartSegments([{day:'a',value:null},{day:'b',value:0},{day:'c',value:5},{day:'d',value:null},{day:'e',value:2}])).toEqual([[1,2],[4]]));
  it('uses unique integer ticks for very low counts', () => { const scale=chartScale([{day:'a',value:1}]);expect(scale.ticks).toEqual([0,1]);expect(chartScale([{day:'a',value:468}]).ceiling).toBeGreaterThanOrEqual(468); });
  it('clamps scaled pointer selection and handles one day', () => {expect(chartIndex(-100,7)).toBe(0);expect(chartIndex(2000,7)).toBe(6);expect(chartIndex(chartX(3,7),7)).toBe(3);expect(chartIndex(500,1)).toBe(0);});
});
