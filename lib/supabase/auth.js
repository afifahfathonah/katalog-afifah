import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function buatKlienAuth() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error("SUPABASE_URL belum diatur");
  }
  if (!publishableKey) {
    throw new Error("SUPABASE_PUBLISHABLE_KEY belum diatur");
  }

  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Diabaikan: setAll dipanggil dari Server Component tidak bisa menulis cookie.
        }
      },
    },
  });
}

