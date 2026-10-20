import { toko } from "@/lib/toko";

export default function TombolWhatsApp({ produk, nama, harga }) {
  const namaProduk = nama ?? produk?.nama ?? "";
  const hargaProduk = harga ?? produk?.harga;

  // Bersihkan nomor dari karakter non-digit
  const nomorBersih = (toko.nomorWhatsApp || "").replace(/\D/g, "");

  // Format harga rupiah dengan Intl.NumberFormat
  const hargaAngka = typeof hargaProduk === "number" ? hargaProduk : Number(hargaProduk);
  const punyaHarga =
    hargaProduk !== null &&
    hargaProduk !== undefined &&
    hargaProduk !== "" &&
    !isNaN(hargaAngka) &&
    hargaAngka >= 0;

  let bagianHarga = "";
  if (punyaHarga) {
    const formatRupiah = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    })
      .format(hargaAngka)
      .replace(/\s+/g, " ");

    bagianHarga = ` (${formatRupiah})`;
  }

  const pesan = `Halo, saya mau pesan ${namaProduk}${bagianHarga}`;
  const href = `https://wa.me/${nomorBersih}?text=${encodeURIComponent(pesan)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
    >
      Pesan via WhatsApp
    </a>
  );
}
