import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example)."
  );
}

// Configured Supabase client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Raw values used by the existing REST helper in App.tsx.
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_KEY = supabaseAnonKey;
