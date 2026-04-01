import { getSupabaseAdmin } from './http.ts';

export const sha256 = async (value: string): Promise<string> => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((part) => part.toString(16).padStart(2, '0'))
    .join('');
};

const DEFAULT_REPORT_ADMIN_EMAIL = 'admin@hondaanzee.be';

export const hashIpAddress = async (ipAddress: string): Promise<string> => {
  const salt = Deno.env.get('REPORT_IP_SALT') || Deno.env.get('SUPABASE_PROJECT_REF') || 'report-salt';
  return sha256(`${salt}:${ipAddress}`);
};

const readBearerToken = (req: Request): string => {
  const authHeader = req.headers.get('Authorization') || '';

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Log eerst in om de admin te openen.');
  }

  const accessToken = authHeader.slice(7).trim();
  if (!accessToken) {
    throw new Error('Je adminsessie is ongeldig of verlopen.');
  }

  return accessToken;
};

export const requireAdminUser = async (req: Request) => {
  const accessToken = readBearerToken(req);
  const allowedEmail = (Deno.env.get('REPORT_ADMIN_EMAIL') || DEFAULT_REPORT_ADMIN_EMAIL)
    .trim()
    .toLowerCase();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new Error('Je adminsessie is ongeldig of verlopen.');
  }

  const userEmail = data.user.email?.trim().toLowerCase();
  if (!userEmail || userEmail !== allowedEmail) {
    throw new Error('Deze gebruiker heeft geen toegang tot het meldpunt admin.');
  }

  return data.user;
};
