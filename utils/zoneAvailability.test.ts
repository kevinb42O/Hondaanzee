import { describe, expect, it } from 'vitest';
import { zoneAvailability } from './zoneAvailability';
import type { OffLeashArea } from '../types';
const zone:OffLeashArea={name:'Test',description:'Test',city:'oostende',address:'Test',slug:'test',lat:51.2,lng:2.9};
describe('confirmed zone availability',()=>{
 it('keeps missing hours unknown, and closure takes priority over always-open',()=>{
  expect(zoneAvailability(zone).open).toBe(null);
  expect(zoneAvailability({...zone,access:'always'}).open).toBe(true);
  expect(zoneAvailability({...zone,access:'always',operationalStatus:'temporarily_closed'}).open).toBe(false);
 });
 it('uses Brussels local time and an exclusive closing boundary',()=>{
  const z={...zone,access:'hours' as const,openingHours:{open:'09:00',close:'18:00'}};
  expect(zoneAvailability(z,new Date('2026-10-02T06:59:00Z')).open).toBe(false);
  expect(zoneAvailability(z,new Date('2026-10-02T07:00:00Z')).open).toBe(true);
  expect(zoneAvailability(z,new Date('2026-10-02T16:00:00Z')).open).toBe(false);
  expect(zoneAvailability(z,new Date('2026-12-02T08:00:00Z')).open).toBe(true);
 });
 it('handles overnight hours without treating equal hours as 24/7',()=>{
  const z={...zone,openingHours:{open:'22:00',close:'06:00'}};
  expect(zoneAvailability(z,new Date('2026-10-02T21:00:00Z')).open).toBe(true);
  expect(zoneAvailability(z,new Date('2026-10-02T03:00:00Z')).open).toBe(true);
  expect(zoneAvailability(z,new Date('2026-10-02T12:00:00Z')).open).toBe(false);
  expect(zoneAvailability({...z,openingHours:{open:'00:00',close:'00:00'}}).open).toBe(false);
 });
});
