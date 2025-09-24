import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// runtime guard for missing env variables to produce clear error
if (!supabaseUrl || !supabaseAnonKey) {
  // throw early so devs see a clear message instead of obscure runtime crashes
  // This will only run in environments where the module is imported.
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Add them to your .env (Vite) and restart the dev server.'
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// A custom storage implementation that avoids using localStorage on the server
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});