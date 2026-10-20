import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatKlienAuth } from "@/lib/supabase/auth";
import { buatKlienServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  // Lapisan keamanan kedua di sisi Server Component
  const supabaseAuth = await buatKlienAuth();
  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  let daftarProduk = null;
  let fetchError = null;

  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Gagal mengambil data produk admin dari Supabase:", error);
      fetchError = error;
    } else {
      daftarProduk = data;
    }
  } catch (err) {
    console.error("Error pada server saat memuat daftar produk admin:", err);
    fetchError = err;
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {fetchError ? (
        <p className="text-sm text-bahaya">
          Gagal memuat daftar produk. Coba muat ulang halaman.
        </p>
      ) : !daftarProduk || daftarProduk.length === 0 ? (
        <p className="text-sm text-teks-lembut">Belum ada produk</p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-teks-lembut">{daftarProduk.length} produk</p>
          <TabelProduk daftarProduk={daftarProduk} />
        </div>
      )}
    </div>
  );
}
