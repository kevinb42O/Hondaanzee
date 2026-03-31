export const sha256 = async (value: string): Promise<string> => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((part) => part.toString(16).padStart(2, '0'))
    .join('');
};

export const hashIpAddress = async (ipAddress: string): Promise<string> => {
  const salt = Deno.env.get('REPORT_IP_SALT') || Deno.env.get('SUPABASE_PROJECT_REF') || 'report-salt';
  return sha256(`${salt}:${ipAddress}`);
};

export const assertAdminKey = async (providedKey: string): Promise<void> => {
  const configuredKey = Deno.env.get('REPORT_ADMIN_SECRET') || '744e8459b5f3d9a2f434c6c911828079bee7e2a4f867c73d';

  if (!configuredKey) {
    throw new Error('REPORT_ADMIN_SECRET ontbreekt.');
  }

  const [providedHash, configuredHash] = await Promise.all([
    sha256(providedKey),
    sha256(configuredKey),
  ]);

  if (providedHash !== configuredHash) {
    throw new Error('Ongeldige admin-sleutel.');
  }
};
