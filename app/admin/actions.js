"use server";

import { redirect } from "next/navigation";
import { buatKlienAuth } from "@/lib/supabase/auth";

export async function masuk(statusSebelumnya, formData) {
  const email = (formData.get("email") ?? "").trim();
  const password = formData.get("password") ?? "";

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await buatKlienAuth();

  let berhasil = false;

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: "Email atau password salah." };
    }
    berhasil = true;
  } catch {
    return { error: "Terjadi kesalahan. Coba beberapa saat lagi." };
  }

  if (berhasil) {
    redirect("/admin");
  }
}

export async function keluar() {
  const supabase = await buatKlienAuth();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

