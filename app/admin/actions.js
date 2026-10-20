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

export async function gantiPassword(statusSebelumnya, formData) {
  const passwordBaru = formData.get("password_baru") ?? "";
  const konfirmasi = formData.get("konfirmasi_password") ?? "";

  if (!passwordBaru || !konfirmasi) {
    return { error: "Semua field wajib diisi." };
  }
  if (passwordBaru.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }
  if (passwordBaru !== konfirmasi) {
    return { error: "Konfirmasi password tidak sama." };
  }

  const supabase = await buatKlienAuth();

  const { data: { user }, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !user) {
    redirect("/admin/login");
  }

  const { error } = await supabase.auth.updateUser({ password: passwordBaru });
  if (error) {
    return { error: "Gagal mengganti password. Coba beberapa saat lagi." };
  }

  return { sukses: "Password berhasil diganti." };
}

export async function keluar() {
  const supabase = await buatKlienAuth();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

