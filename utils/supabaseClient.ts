import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zpllibfxaizavcvztnut.supabase.co';
const supabaseKey = 'sb_publishable_GKqZaSHpJMqZkwHn8P-tvw_ln99uIB8';

export const supabase = createClient(supabaseUrl, supabaseKey);
