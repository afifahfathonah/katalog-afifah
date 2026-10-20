import "server-only";
import { createClient } from "@supabase/supabase-js";

export function buatKlienServer() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url) {
    throw new Error("SUPABASE_URL belum diatur");
  }

  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY belum diatur");
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

