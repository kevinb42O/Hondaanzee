import { describe, expect, it } from 'vitest';
import { normalizePushUrl, pushDeliveryLabel, pushUrlError } from './adminNotifications';

describe('notification destinations and honest delivery labels', () => {
  it('preserves existing valid destinations and normalizes website paths', () => {
    for (const value of ['/', '/blog/strand?tip=1#honden', 'https://hondaanzee.be/meldpunt', 'https://example.com/']) expect(pushUrlError(value)).toBeNull();
    expect(normalizePushUrl(' updates ')).toBe('/updates');
    expect(normalizePushUrl('')).toBe('/');
  });
  it('does not expose unsafe links in previews or confirmation', () => {
    for (const value of ['javascript:alert(1)', 'data:text/html,x', '//example.com', '/\\example.com', 'https://user:password@example.com', 'https://', '/a b']) expect(pushUrlError(value)).not.toBeNull();
  });
  it('never calls a zero-delivery or partial batch a success', () => {
    expect(pushDeliveryLabel({sent_count:0,failed_count:0,total_count:0})).toBe('Geen ontvangers');
    expect(pushDeliveryLabel({sent_count:0,failed_count:3,total_count:3})).toBe('Niet afgeleverd');
    expect(pushDeliveryLabel({sent_count:2,failed_count:1,total_count:3})).toBe('Deels afgeleverd');
    expect(pushDeliveryLabel({sent_count:3,failed_count:0,total_count:3})).toBe('Afgeleverd');
  });
});
