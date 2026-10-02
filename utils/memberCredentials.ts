export function validateMemberPassword(password: string, repeated: string): string | null {
  if (password.length < 8) return 'Kies een wachtwoord van minstens 8 tekens.';
  if (password.length > 128) return 'Je wachtwoord mag maximaal 128 tekens bevatten.';
  if (password !== repeated) return 'Je wachtwoorden komen niet overeen. Vul hetzelfde wachtwoord tweemaal in.';
  return null;
}
