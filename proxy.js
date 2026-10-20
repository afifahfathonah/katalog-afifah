import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Siapkan response yang akan diteruskan (cookie bisa ditulis ke dalamnya)
  let response = NextResponse.next({ request });

  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  // Jika variabel lingkungan belum diatur, lanjutkan saja tanpa pemeriksaan auth
  if (!url || !publishableKey) {
    return response;
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Tulis cookie ke request sekaligus ke response agar sesi tersegar
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Periksa pengguna yang sedang login (getUser lebih aman dari getSession)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sudahLogin = !!user;
  const diHalamanLogin = pathname === "/admin/login";

  if (diHalamanLogin) {
    // Admin yang sudah login tidak perlu melihat halaman login → alihkan ke /admin
    if (sudahLogin) {
      const tujuan = new URL("/admin", request.url);
      const redirectResponse = NextResponse.redirect(tujuan);
      // Teruskan cookie sesi yang sudah diperbarui ke redirect response
      response.cookies.getAll().forEach(({ name, value, ...options }) => {
        redirectResponse.cookies.set(name, value, options);
      });
      return redirectResponse;
    }
    return response;
  }

  // Semua rute /admin lainnya → wajib login
  if (!sudahLogin) {
    const tujuan = new URL("/admin/login", request.url);
    const redirectResponse = NextResponse.redirect(tujuan);
    response.cookies.getAll().forEach(({ name, value, ...options }) => {
      redirectResponse.cookies.set(name, value, options);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

