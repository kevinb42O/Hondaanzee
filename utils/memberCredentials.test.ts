import { describe, expect, it } from 'vitest';
import { validateMemberPassword } from './memberCredentials.ts';
describe('member registration passwords', () => {
  it('requires the complete passwords to match, including spaces and case', () => {
    expect(validateMemberPassword('Zand tussen poten', 'Zand tussen poten')).toBeNull();
    expect(validateMemberPassword('Zand tussen poten', 'zand tussen poten')).toMatch(/komen niet overeen/);
    expect(validateMemberPassword('Zand tussen poten ', 'Zand tussen poten')).toMatch(/komen niet overeen/);
  });
  it('bounds the password length', () => {
    expect(validateMemberPassword('1234567', '1234567')).toMatch(/minstens 8/);
    expect(validateMemberPassword('x'.repeat(129), 'x'.repeat(129))).toMatch(/maximaal 128/);
    expect(validateMemberPassword('12345678', '12345678')).toBeNull();
  });
});
