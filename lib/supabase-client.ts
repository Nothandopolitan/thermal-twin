import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    '[supabase-client] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Make sure a .env file with these values exists in the project root and that the dev server was restarted after adding it. ' +
    'Falling back to a placeholder client so the app can still render (Supabase calls will fail until this is fixed).'
  );
}

// Falling back to harmless placeholder values instead of empty strings prevents
// createClient() from throwing "supabaseUrl is required", which previously crashed
// the entire app (AuthProvider wraps every page in app/layout.tsx) and caused a
// blank white screen with no visible error.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
