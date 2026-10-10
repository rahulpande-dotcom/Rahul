import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === "string" &&
    supabaseUrl.length > 0 &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-project") &&
    typeof supabaseAnonKey === "string" &&
    supabaseAnonKey.length > 20
  );
};

// Client for browser-side calls
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin/Server client with service role key if present, otherwise anon key
export const getSupabaseServerClient = () => {
  if (!isSupabaseConfigured()) return null;
  const key = supabaseServiceKey && !supabaseServiceKey.includes("your-") ? supabaseServiceKey : supabaseAnonKey;
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
