# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:** **[SENDIRI]**

```
KONTEKS
Proyek ini katalog UMKM berbasis Next.js 16 (App Router) dengan Supabase. Saat ini app/page.jsx masih menampilkan data contoh dan komponen CatatanBelumAktif bertuliskan "Masih data contoh". Environment variable SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, dan SUPABASE_SECRET_KEY sudah terisi di .env.local.

PERSIAPAN (baca dulu, jangan ubah apa pun sebelum selesai membaca)
1. Baca AGENTS.md sampai habis, terutama aturan keamanan dan konvensi kode.
2. Baca docs/user-stories.md bagian US-01 beserta kriteria penerimaannya.
3. Baca docs/schema.sql untuk mengetahui nama kolom tabel "produk" yang sebenarnya.
4. Baca app/page.jsx, components/KartuProduk.jsx, dan file data contoh yang dipakai sekarang, untuk melihat props apa yang diharapkan KartuProduk. Cocokkan nama kolom database dengan nama props tersebut, dan ubah pemetaan di app/page.jsx, bukan di KartuProduk.

TUJUAN
Daftar produk di halaman utama diambil dari tabel "produk" di Supabase, di sisi server, bukan dari data contoh.

LANGKAH KERJA
1. Cek package.json. Kalau @supabase/supabase-js belum ada, install dengan npm install @supabase/supabase-js.
2. Buat lib/supabase/server.js:
   - Ekspor fungsi (misalnya buatKlienServer) yang mengembalikan klien Supabase dari createClient.
   - Pakai process.env.SUPABASE_URL dan process.env.SUPABASE_SECRET_KEY.
   - Kalau salah satu variabel kosong, lempar Error dengan pesan jelas (misalnya "SUPABASE_URL belum diatur"), tanpa mencetak nilai kuncinya.
   - Tambahkan di baris atas: import "server-only" kalau paket itu tersedia, supaya file ini tidak bisa terbawa ke browser. Kalau belum ada, install dengan npm install server-only.
   - Nonaktifkan persistensi sesi pada klien ini (auth: { persistSession: false, autoRefreshToken: false }) karena ini klien server tanpa pengguna.
3. Ubah app/page.jsx menjadi Server Component async (tanpa "use client"):
   - Panggil klien server, lalu ambil data: .from("produk").select("*").order("id", { ascending: true }).
   - Tangani { data, error } dengan tiga cabang yang jelas, dijelaskan di bawah.
4. Cabang tampilan:
   a. Jika error: tampilkan pesan yang jelas dan ramah di halaman, misalnya "Gagal memuat produk. Coba muat ulang halaman beberapa saat lagi." Catat detail error asli dengan console.error di server saja. Jangan tampilkan pesan error mentah Supabase, nama tabel, atau kunci apa pun ke pengunjung.
   b. Jika data kosong (null atau array panjang 0): tampilkan teks persis "Belum ada produk".
   c. Jika ada data: render setiap produk dengan komponen KartuProduk yang sudah ada. Beri key yang stabil (produk.id). Layout grid dan kelas CSS yang sudah ada tidak boleh berubah.
5. Hapus komponen CatatanBelumAktif dari app/page.jsx beserta import-nya. Tulisan "Masih data contoh" tidak boleh muncul lagi di halaman utama.
6. Pastikan halaman tidak di-cache statis, supaya perubahan data di Supabase langsung terlihat saat halaman dimuat ulang. Tambahkan export const dynamic = "force-dynamic" di app/page.jsx.
7. Jangan hapus file data contoh kalau masih dipakai file lain. Cek dengan pencarian dulu. Kalau sudah tidak dipakai siapa pun, biarkan saja dan sebutkan di laporan.

BATASAN KERAS
- Jangan ubah tampilan, CSS, atau isi komponen KartuProduk.
- Jangan pakai awalan NEXT_PUBLIC_ untuk variabel Supabase dan jangan buat klien Supabase di komponen client.
- Jangan membuat atau mengubah .env.local, dan jangan mencetak isi file itu.
- Jangan menjalankan perintah Git apa pun (add, commit, push, dll).

VERIFIKASI SEBELUM SELESAI
- Jalankan npm run lint (kalau ada) dan npm run build. Perbaiki error yang muncul dari perubahanmu.
- Pastikan tidak ada pesan "Masih data contoh" tersisa di app/page.jsx.

LAPORAN AKHIR
Tulis ringkas: (1) file yang dibuat dan diubah, (2) nama kolom database yang dipetakan ke props KartuProduk, (3) cara kerja tiga cabang tampilan, (4) hal yang perlu saya cek manual.
```

**Hasil:** Halaman utama (`localhost:3000`) sekarang mengambil produk dari tabel `produk` di Supabase di sisi server, bukan lagi dari data contoh.

- File baru: `lib/supabase/server.js`, berisi klien Supabase untuk server yang memakai `SUPABASE_URL` dan `SUPABASE_SECRET_KEY`. Kalau salah satu variabel kosong, klien melempar error dengan pesan jelas tanpa mencetak nilai kuncinya.
- File diubah: `app/page.jsx`, sekarang Server Component async yang menjalankan `select("*")` dan mengurutkan berdasarkan `id`.
- Tiga kondisi ditangani: gagal ambil data menampilkan pesan error yang ramah (detail teknis hanya dicatat di console server), tabel kosong menampilkan tulisan "Belum ada produk", dan jika ada data setiap produk dirender dengan komponen `KartuProduk` yang sudah ada.
- Komponen `CatatanBelumAktif` dihapus dari halaman ini, jadi tulisan "Masih data contoh" hilang. Enam kartu produk tetap tampil dengan tampilan yang sama.
- Halaman tidak di-cache statis (`dynamic = "force-dynamic"`), sehingga perubahan di database langsung terlihat setelah muat ulang.
- Pembuktian: nama satu produk diubah di Supabase Table Editor (misalnya menjadi "Kopi Spesial"), halaman dimuat ulang, dan nama di kartu ikut berubah.
- Keamanan: kunci rahasia hanya dibaca di server dan tidak memakai awalan `NEXT_PUBLIC_`.

**Perbaikan:** Saat pertama dijalankan halaman menampilkan error `SUPABASE_URL belum diatur`. Kodenya sudah benar, masalahnya `SUPABASE_URL` tidak terbaca dari `.env.local`. Langkah perbaikannya:

1. Server pengembangan dihentikan (Ctrl+C) lalu dijalankan lagi dengan `npm run dev`, karena Next.js hanya membaca `.env.local` saat start.
2. Dipastikan `.env.local` ada di root proyek (sejajar `package.json`) dan namanya persis `.env.local`, bukan `.env.local.txt`.
3. Dipastikan isinya berformat `NAMA=nilai` tanpa spasi di sekitar tanda sama dengan dan tanpa tanda kutip, serta file sudah disimpan (Ctrl+S).
4. Nama variabel dicek persis `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, dan `SUPABASE_SECRET_KEY`.

Setelah itu halaman memuat produk dari Supabase dan 6 kartu tampil normal. Rinciannya ada di bagian Debugging.

## US-02 Detail produk

**Prompt:** **[SENDIRI]**

```
KONTEKS
Halaman utama sudah mengambil produk dari Supabase lewat klien server di lib/supabase/server.js. Sekarang halaman detail app/produk/[id]/page.jsx perlu mengikuti pola yang sama.

PERSIAPAN
1. Baca docs/user-stories.md bagian US-02 beserta kriteria penerimaannya.
2. Baca lib/supabase/server.js untuk mengetahui nama fungsi yang diekspor, dan pakai fungsi itu. Jangan membuat koneksi Supabase baru.
3. Baca app/produk/[id]/page.jsx yang sekarang dan app/page.jsx (sebagai contoh pola yang sudah benar).
4. Baca docs/schema.sql untuk mengetahui tipe kolom id (angka atau uuid). Penanganan validasi id harus sesuai tipenya.

TUJUAN
Halaman detail menampilkan satu produk dari tabel "produk" berdasarkan id di URL, diambil di sisi server.

LANGKAH KERJA
1. Jadikan page.jsx Server Component async. Di Next.js 16, params adalah Promise, jadi ambil id dengan: const { id } = await params.
2. Validasi id sebelum query:
   - Jika id di database bertipe angka dan id di URL bukan bilangan bulat positif (misalnya "abc", "-1", "1.5"), langsung panggil notFound() tanpa query.
   - Jika bertipe uuid, validasi formatnya dulu.
3. Ambil satu baris: .from("produk").select("*").eq("id", id).maybeSingle().
4. Tangani hasil:
   a. Jika error: tampilkan pesan error yang jelas di halaman (tanpa detail teknis), catat detail dengan console.error.
   b. Jika data null (produk tidak ada): panggil notFound() yang diimpor dari "next/navigation".
   c. Jika ada data: tampilkan foto, nama, harga, dan deskripsi dengan markup dan kelas CSS yang sudah ada.
5. Kalau ada fungsi format harga rupiah di file ini atau di lib/, tetap pakai. Jangan ganti caranya.
6. Pastikan data tidak di-cache statis: tambahkan export const dynamic = "force-dynamic".
7. Hapus CatatanBelumAktif dari halaman ini beserta import-nya. Biarkan komponen TombolWhatsApp dan posisinya seperti sekarang, karena akan dikerjakan di langkah berikutnya.
8. Kalau halaman memakai generateMetadata atau generateStaticParams, sesuaikan agar tetap valid. generateStaticParams yang bergantung pada data contoh harus dihapus atau diganti, jangan dibiarkan rusak.

BATASAN KERAS
- Jangan ubah tampilan, CSS, atau komponen lain.
- Jangan membuat klien Supabase baru dan jangan memakai kunci di komponen client.
- Jangan menjalankan perintah Git apa pun.

VERIFIKASI SEBELUM SELESAI
- Jalankan npm run lint dan npm run build, lalu perbaiki error dari perubahanmu.
- Telusuri secara logika tiga kasus: id valid, id angka yang tidak ada (9999), dan id bukan angka (abc). Pastikan dua kasus terakhir berakhir di notFound().

LAPORAN AKHIR
Ringkas: file yang diubah, cara validasi id, cara penanganan error vs tidak ditemukan, dan hal yang perlu saya cek manual.
```

**Hasil:** Halaman detail `app/produk/[id]/page.jsx` sekarang mengambil satu produk dari tabel `produk` di Supabase berdasarkan `id` di URL, di sisi server, memakai klien server dari `lib/supabase/server.js` (tidak membuat koneksi baru).

- Halaman menjadi Server Component async dan membaca id dengan `await params` sesuai aturan Next.js 16.
- Id divalidasi dulu sebelum query. Id yang bukan angka valid (misalnya `abc`) langsung diarahkan ke `notFound()`.
- Query memakai `.eq("id", id).maybeSingle()`. Kalau produk tidak ada, halaman memanggil `notFound()` dan tampil "Halaman tidak ditemukan". Kalau terjadi error lain, tampil pesan error yang jelas tanpa detail teknis.
- Foto, nama, harga, dan deskripsi tampil dengan markup dan kelas CSS yang sudah ada, jadi tampilan tidak berubah. Data tidak di-cache statis.
- Komponen `CatatanBelumAktif` dihapus dari halaman ini. Tombol WhatsApp dibiarkan seperti semula untuk dikerjakan di US-03.
- Pengujian: klik salah satu kartu produk, halaman detail terbuka dengan data dari database. Deskripsi diubah di Supabase lalu halaman dimuat ulang, dan deskripsi ikut berubah. `localhost:3000/produk/9999` menampilkan halaman "Halaman tidak ditemukan".

**Perbaikan:** Tidak ada perbaikan besar yang diperlukan. Prompt pertama sudah menghasilkan halaman yang sesuai kriteria, dan error environment variable dari US-01 tidak muncul lagi karena `.env.local` sudah diperbaiki.

## US-03 Pesan via WhatsApp

**Prompt:** **[SENDIRI]**

```
KONTEKS
Halaman detail produk sudah mengambil data dari Supabase. Tombol WhatsApp saat ini hanya tampilan. Nomor toko disimpan di lib/toko.js sebagai toko.nomorWhatsApp (format internasional, tanpa + dan tanpa 0 di depan, misalnya 6281234567890).

PERSIAPAN
1. Baca docs/rancangan-teknis.md bagian "Pesan WhatsApp (US-03)" dan ikuti spesifikasinya kalau ada yang lebih spesifik dari prompt ini.
2. Baca docs/user-stories.md bagian US-03.
3. Baca lib/toko.js, components/TombolWhatsApp.jsx, dan app/produk/[id]/page.jsx untuk melihat bagaimana tombol dipanggil dan props apa yang sudah dikirim.

TUJUAN
Tombol membuka WhatsApp ke nomor toko dengan pesan otomatis berisi nama dan harga produk.

LANGKAH KERJA
1. Ubah components/TombolWhatsApp.jsx menjadi tautan <a> (bukan <button> dengan onClick) dengan href berbentuk:
   https://wa.me/{nomorWhatsApp}?text={pesanTerenkode}
2. Nomor diambil dari toko.nomorWhatsApp di lib/toko.js. Jangan menulis nomor langsung di komponen. Bersihkan nomor dari karakter non-digit sebelum dipakai, sebagai pengaman.
3. Isi pesan persis berformat:
   "Halo, saya mau pesan {nama produk} ({harga rupiah})"
   Contoh: "Halo, saya mau pesan Kopi Bubuk Robusta 250 g (Rp 45.000)".
4. Format harga rupiah dengan Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }). Hasilnya harus "Rp 45.000", dengan titik sebagai pemisah ribuan. Kalau hasilnya memakai spasi non-breaking (karakter khusus) yang mengganggu, ganti dengan spasi biasa.
5. Encode seluruh pesan dengan encodeURIComponent, supaya spasi, tanda kurung, dan karakter khusus pada nama produk (misalnya "&", "#", "+", atau tanda petik) tidak merusak URL.
6. Buka di tab baru: target="_blank" dan rel="noopener noreferrer".
7. Props: terima nama dan harga produk (sesuaikan dengan apa yang sudah dikirim halaman detail). Kalau halaman detail belum mengirimnya, tambahkan di pemanggilan di app/produk/[id]/page.jsx dengan perubahan sekecil mungkin.
8. Pertahankan kelas CSS dan tampilan tombol persis seperti sekarang, termasuk teks pada tombol dan ikon kalau ada.
9. Jadikan komponen ini Server Component biasa (tanpa "use client") karena hanya berisi tautan.
10. Hapus CatatanBelumAktif yang menyebut US-03 dari halaman detail produk beserta import-nya. Jangan hapus catatan lain kalau ada.

KASUS TEPI
- Nama produk sangat panjang atau berisi karakter khusus: URL tetap valid.
- Harga bernilai 0 atau kosong: tampilkan "Rp 0" atau jangan sertakan bagian harga. Pilih yang paling masuk akal dan sebutkan pilihanmu di laporan.

BATASAN KERAS
- Jangan ubah tampilan dan jangan menjalankan perintah Git apa pun.

VERIFIKASI SEBELUM SELESAI
- Jalankan npm run lint dan npm run build.
- Tampilkan URL lengkap yang dihasilkan untuk satu contoh produk (sebelum dan sesudah encode) supaya saya bisa memeriksanya.

LAPORAN AKHIR
Ringkas file yang diubah, contoh URL hasil, dan keputusan untuk kasus tepi.
```

**Hasil:** Tombol pesan di halaman detail sekarang berupa tautan (`<a>`) yang membuka WhatsApp dengan pesan otomatis berisi nama dan harga produk.

- File diubah: `components/TombolWhatsApp.jsx`, dengan `href` berbentuk `https://wa.me/{nomor}?text={pesan}`.
- Nomor tidak ditulis langsung di komponen, tetapi diambil dari `toko.nomorWhatsApp` di `lib/toko.js`.
- Format pesan: "Halo, saya mau pesan {nama produk} ({harga})". Contohnya "Halo, saya mau pesan Kopi Bubuk Robusta 250 g (Rp 45.000)".
- Harga diformat rupiah dengan `Intl.NumberFormat("id-ID")` sehingga tampil "Rp 45.000" dengan titik sebagai pemisah ribuan.
- Seluruh pesan di-encode dengan `encodeURIComponent`, sehingga spasi, tanda kurung, dan karakter khusus pada nama produk tidak merusak URL.
- Tautan dibuka di tab baru dengan `target="_blank"` dan `rel="noopener noreferrer"`. Kelas CSS dan tampilan tombol tidak berubah.
- `CatatanBelumAktif` yang menyebut US-03 dihapus dari halaman detail.
- Pengujian: klik tombol di halaman detail, WhatsApp Web atau aplikasi WhatsApp terbuka ke nomor toko dengan pesan sudah terisi. Dicoba juga di HP lewat link Vercel.

**Perbaikan:** Tidak ada perbaikan besar yang diperlukan. Kasus tepi (nama produk dengan karakter khusus dan harga kosong) sudah ditangani dari prompt awal.

## US-04 Login admin

**Prompt:** **[SENDIRI]**

```
KONTEKS
Halaman /admin dan /admin/login sudah ada sebagai tampilan saja. Sekarang login harus benar-benar bekerja memakai Supabase Auth (email + password). Akun admin sudah dibuat di Supabase (Authentication → Users) dan pendaftaran akun baru sudah dimatikan. Variabel SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY sudah ada di .env.local.

PERSIAPAN
1. Baca AGENTS.md bagian aturan keamanan sampai habis.
2. Baca docs/user-stories.md bagian US-04.
3. Baca app/admin/login/page.jsx, components/NavAdmin.jsx, app/admin/page.jsx, dan app/admin/actions.js (kalau sudah ada).
4. Perhatikan: klien lib/supabase/server.js yang sudah ada memakai SUPABASE_SECRET_KEY untuk membaca produk. Jangan dipakai untuk login. Login memakai kunci publishable lewat @supabase/ssr dan cookie.

TUJUAN
Admin bisa masuk dan keluar. Sesi tersimpan di cookie. Semua logika auth berjalan di server.

LANGKAH KERJA
1. Install @supabase/ssr kalau belum ada di package.json.
2. Buat lib/supabase/auth.js (klien auth sisi server):
   - Pakai createServerClient dari @supabase/ssr dengan process.env.SUPABASE_URL dan process.env.SUPABASE_PUBLISHABLE_KEY.
   - Di Next.js 16, cookies() dari "next/headers" bersifat async: const cookieStore = await cookies().
   - Implementasikan cookies.getAll() dan cookies.setAll(). Bungkus setAll dengan try/catch, karena pemanggilan dari Server Component tidak boleh menulis cookie (error itu aman diabaikan).
   - Ekspor fungsi async (misalnya buatKlienAuth).
3. Buat atau lengkapi app/admin/actions.js dengan "use server" di baris pertama:
   a. masuk(statusSebelumnya, formData):
      - Ambil email dan password dari formData, lalu trim email.
      - Jika salah satu kosong, kembalikan { error: "Email dan password wajib diisi." }.
      - Panggil supabase.auth.signInWithPassword({ email, password }).
      - Jika gagal, kembalikan { error: "Email atau password salah." } dengan satu pesan yang sama untuk semua jenis kegagalan, supaya tidak membocorkan apakah email terdaftar.
      - Jika berhasil, panggil redirect("/admin") dari "next/navigation". redirect() harus dipanggil di luar blok try/catch.
   b. keluar():
      - Panggil supabase.auth.signOut(), lalu redirect("/admin/login").
4. Sambungkan form di app/admin/login/page.jsx:
   - Pakai useActionState (React 19) dengan action masuk. Karena hook ini butuh komponen client, pisahkan form menjadi komponen client kecil (misalnya components/FormLogin.jsx dengan "use client") dan biarkan page.jsx tetap Server Component.
   - Tampilkan state.error di halaman login pada elemen yang jelas terlihat (role="alert").
   - Nonaktifkan tombol dan tampilkan teks "Memproses..." selama form dikirim (pakai isPending dari useActionState).
   - Pertahankan markup, kelas CSS, dan tampilan yang ada. Field harus punya name="email" dan name="password" dan atribut autoComplete yang sesuai.
5. Sambungkan tombol "Keluar" di components/NavAdmin.jsx:
   - Bungkus dengan <form action={keluar}> dan tombol type="submit". Jangan memanggil Supabase dari browser.
6. Hapus CatatanBelumAktif dari halaman login beserta import-nya.

ATURAN KEAMANAN
- Tidak boleh ada permintaan ke supabase.co dari browser. Semua auth lewat Server Action.
- Jangan pakai variabel berawalan NEXT_PUBLIC_ dan jangan pakai SUPABASE_SECRET_KEY untuk auth pengguna.
- Jangan console.log email, password, atau token.

BATASAN KERAS
- Jangan ubah tampilan, jangan buat halaman baru selain komponen form yang diperlukan, dan jangan menjalankan perintah Git apa pun.

VERIFIKASI SEBELUM SELESAI
- Jalankan npm run lint dan npm run build.
- Telusuri tiga alur: password salah, login berhasil, klik Keluar. Pastikan masing-masing mengarah ke hasil yang benar.

LAPORAN AKHIR
Ringkas file yang dibuat dan diubah, alur login sampai redirect dalam 3-4 kalimat, dan hal yang perlu saya cek manual.
```

**Hasil:** Login admin sekarang memakai Supabase Auth (email dan password) dengan sesi tersimpan di cookie, dan seluruh prosesnya berjalan di server.

- File baru: `lib/supabase/auth.js`, klien Supabase sisi server berbasis `@supabase/ssr` yang memakai `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY` dan membaca serta menulis cookie dengan `await cookies()`.
- File baru: `components/FormLogin.jsx`, komponen client kecil dengan `useActionState` untuk menampilkan pesan error dan status "Memproses..." saat form dikirim. `app/admin/login/page.jsx` tetap Server Component.
- File diubah: `app/admin/actions.js` dengan action `masuk` (memanggil `signInWithPassword`) dan `keluar` (memanggil `signOut`).
- Login gagal menampilkan satu pesan yang sama ("Email atau password salah.") untuk semua jenis kegagalan, supaya tidak membocorkan apakah email terdaftar.
- Login berhasil diarahkan ke `/admin`. Tombol "Keluar" di `components/NavAdmin.jsx` dibungkus form yang memanggil action `keluar`, lalu kembali ke `/admin/login`.
- `CatatanBelumAktif` dihapus dari halaman login, dan tampilan tidak berubah.
- Pengujian: password salah menampilkan pesan error, email dan password bawaan dari Langkah 4 masuk ke halaman admin, dan klik Keluar kembali ke halaman login.
- Keamanan: tidak ada permintaan ke `supabase.co` dari browser, tidak memakai `NEXT_PUBLIC_`, dan secret key tidak dipakai untuk auth pengguna.

**Perbaikan:** Saat halaman login dibuka muncul Runtime Error `SUPABASE_PUBLISHABLE_KEY belum diatur` dari `buatKlienAuth` di `lib/supabase/auth.js`. Kodenya benar, masalahnya variabel itu tidak terbaca dari `.env.local` (katalog sudah jalan, jadi hanya baris kunci publishable yang bermasalah). Langkah perbaikannya:

1. Nama variabel dicek persis `SUPABASE_PUBLISHABLE_KEY` (bukan `SUPABASE_PUBLIC_KEY`, `SUPABASE_ANON_KEY`, atau yang berawalan `NEXT_PUBLIC_`).
2. Nilainya diisi dari Supabase, Project Settings, API Keys, Publishable key (berawalan `sb_publishable_`), tanpa tertukar dengan secret key.
3. File disimpan, lalu server dihentikan dengan Ctrl+C dan dijalankan lagi dengan `npm run dev`.
4. Di Vercel, variabel yang sama dicek di Settings, Environment Variables, lalu di-Redeploy.

Setelah itu halaman login tampil normal dan login berfungsi. Rinciannya ada di bagian Debugging.

## US-05 Ganti password

**Prompt:** **[SENDIRI]**

```
KONTEKS
Login admin sudah berfungsi (US-04). app/admin/actions.js sudah berisi action masuk dan keluar, dan lib/supabase/auth.js menyediakan klien auth berbasis cookie. Halaman app/admin/password/page.jsx masih berupa tampilan saja.

PERSIAPAN
1. Baca docs/user-stories.md bagian US-05.
2. Baca app/admin/actions.js, lib/supabase/auth.js, dan app/admin/password/page.jsx. Ikuti pola useActionState dan komponen form client yang sudah dipakai di halaman login.

TUJUAN
Admin yang sedang login bisa mengganti passwordnya, dengan validasi yang dilakukan di server.

LANGKAH KERJA
1. Tambahkan Server Action gantiPassword(statusSebelumnya, formData) di app/admin/actions.js:
   a. Buat klien auth, lalu panggil supabase.auth.getUser(). Jika tidak ada pengguna, redirect("/admin/login") atau kembalikan { error: "Sesi berakhir. Silakan masuk lagi." }.
   b. Ambil passwordBaru dan konfirmasi dari formData. Nama field harus sesuai dengan form yang ada, jadi cek dulu markup halamannya.
   c. Validasi di server, berurutan, dan kembalikan { error } pada kegagalan pertama:
      - field kosong: "Semua kolom wajib diisi."
      - panjang kurang dari 8 karakter: "Password baru minimal 8 karakter."
      - passwordBaru tidak sama dengan konfirmasi: "Konfirmasi password tidak sama."
   d. Jika lolos validasi, panggil supabase.auth.updateUser({ password: passwordBaru }).
   e. Jika Supabase mengembalikan error, kembalikan pesan yang jelas dalam bahasa Indonesia (misalnya "Gagal mengganti password. Coba lagi."), dan catat detailnya dengan console.error tanpa mencetak password.
   f. Jika sukses, kembalikan { sukses: "Password berhasil diganti." }.
2. Sambungkan ke form di app/admin/password/page.jsx:
   - Pisahkan form menjadi komponen client kecil dengan useActionState (seperti form login). Biarkan page.jsx sebagai Server Component.
   - Tampilkan state.error atau state.sukses pada elemen pesan yang jelas (role="alert" untuk error, role="status" untuk sukses). Pesan sukses dan error tidak boleh muncul bersamaan.
   - Tampilkan "Memproses..." dan nonaktifkan tombol saat form dikirim.
   - Kosongkan field setelah sukses (misalnya dengan key pada form atau reset form).
   - Input bertipe password dengan autoComplete="new-password" dan minLength={8} (hanya sebagai kemudahan; validasi utama tetap di server).
   - Pertahankan markup dan CSS yang sudah ada.
3. Hapus CatatanBelumAktif dari halaman ini beserta import-nya.

ATURAN KEAMANAN
- Validasi wajib di server. Validasi di browser hanya pelengkap.
- Jangan pernah console.log atau mengembalikan password dalam respons.
- Jangan simpan password di state client lebih lama dari yang diperlukan.

BATASAN KERAS
- Jangan ubah tampilan dan jangan menjalankan perintah Git apa pun.

VERIFIKASI SEBELUM SELESAI
- Jalankan npm run lint dan npm run build.
- Telusuri kasus: password 7 karakter, konfirmasi berbeda, field kosong, dan sukses.

LAPORAN AKHIR
Ringkas file yang diubah, daftar validasi di server, dan hal yang perlu saya cek manual.
```

**Hasil:** Admin yang sedang login sekarang bisa mengganti password lewat halaman `/admin/password`, dengan validasi sepenuhnya di server.

- File diubah: `app/admin/actions.js`, ditambah action `gantiPassword` yang pertama-tama memeriksa sesi dengan `getUser()`. Kalau tidak ada pengguna, pengguna diarahkan ke `/admin/login`.
- Validasi di server, berurutan: semua kolom wajib diisi, password baru minimal 8 karakter, dan password baru harus sama dengan konfirmasi. Masing-masing punya pesan error yang spesifik dalam bahasa Indonesia.
- Jika lolos validasi, action memanggil `supabase.auth.updateUser({ password })`. Hasilnya berupa pesan "Password berhasil diganti." atau pesan error yang jelas kalau Supabase menolak.
- File diubah: `app/admin/password/page.jsx`, form dipisah menjadi komponen client dengan `useActionState` supaya pesan sukses atau error tampil di halaman. Tombol dinonaktifkan selama diproses dan field dikosongkan setelah sukses. Tampilannya tidak berubah.
- `CatatanBelumAktif` dihapus dari halaman ini.
- Pengujian: password baru terdiri dari minimal 8 karakter dan muncul pesan berhasil. Setelah klik Keluar, password bawaan gagal dan password baru berhasil. Password juga diganti di aplikasi online (link Vercel).
- Keamanan: password tidak pernah dicetak ke log dan tidak dikembalikan dalam respons.

**Perbaikan:** Tidak ada perbaikan besar yang diperlukan. Karena password bawaan yang masih aktif mengurangi keamanan, password juga diganti di versi Vercel setelah deploy.

## US-06 Proteksi halaman admin

**Prompt:** **[SENDIRI]**

```
KONTEKS
Login dan ganti password sudah berjalan, tetapi halaman /admin masih bisa dibuka siapa saja yang mengetik URL-nya. Proyek memakai Next.js 16, yang menamai middleware menjadi proxy: file proxy.js di root proyek (sejajar dengan folder app), bukan middleware.js.

PERSIAPAN
1. Baca AGENTS.md aturan keamanan nomor 3 dan 4 dengan teliti.
2. Baca docs/user-stories.md bagian US-06.
3. Baca lib/supabase/auth.js, app/admin/actions.js, dan struktur folder app/admin untuk mengetahui semua rute yang ada.

TUJUAN
Semua rute /admin, kecuali /admin/login, hanya bisa diakses setelah login. Perlindungan ada di dua lapis: proxy untuk halaman, dan pemeriksaan langsung di setiap Server Action yang mengubah data.

LANGKAH KERJA
1. Buat proxy.js di root proyek:
   - Ekspor fungsi proxy(request) (nama ekspor sesuai konvensi Next.js 16) dan export const config = { matcher: ["/admin/:path*"] }.
   - Di dalamnya buat klien Supabase dengan createServerClient dari @supabase/ssr (SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY). Cookie dibaca dari request.cookies.getAll() dan ditulis lewat setAll ke request dan response, seperti pola resmi @supabase/ssr untuk middleware/proxy.
   - Periksa pengguna dengan supabase.auth.getUser(), BUKAN getSession(), karena getSession tidak memverifikasi token ke server.
2. Aturan akses di proxy:
   - Jika pathname adalah /admin/login: jika sudah login, alihkan ke /admin. Jika belum, biarkan lewat.
   - Semua rute /admin lainnya (termasuk /admin, /admin/password, dan rute di bawahnya): jika belum login, alihkan ke /admin/login dengan NextResponse.redirect.
3. Pastikan cookie sesi yang diperbarui ikut terbawa di response, termasuk di response redirect (salin cookie dari response Supabase ke redirect).
4. Lapisan kedua: periksa setiap Server Action di app/admin/actions.js.
   - Setiap action yang mengubah data atau memerlukan sesi (gantiPassword dan action lain, termasuk yang akan ditambahkan nanti) wajib memanggil supabase.auth.getUser() di awal dan menolak kalau tidak ada pengguna. Tambahkan pemeriksaan di action yang belum punya.
   - Buat fungsi pembantu kecil (misalnya pastikanAdmin()) di file yang sama atau di lib/supabase/auth.js supaya pemeriksaan konsisten dan mudah dipakai ulang.
   - Action masuk dikecualikan karena tujuannya memang membuat sesi.
5. Hapus CatatanBelumAktif dari halaman /admin (app/admin/page.jsx) beserta import-nya.

KASUS TEPI
- Rute /admin/login/ dengan garis miring di akhir, atau /admin/Login dengan huruf besar: pastikan tidak menjadi celah. Gunakan perbandingan pathname yang tepat.
- Aset statis dan rute publik (/, /produk/...) tidak boleh terkena proxy.

BATASAN KERAS
- Jangan ubah tampilan, jangan memakai SUPABASE_SECRET_KEY di proxy, dan jangan menjalankan perintah Git apa pun.

VERIFIKASI SEBELUM SELESAI
- Jalankan npm run lint dan npm run build. Pastikan build tidak memperingatkan soal middleware yang usang.
- Telusuri secara logika: belum login ke /admin dan /admin/password dialihkan ke login, sudah login ke /admin terbuka normal, dan sudah login ke /admin/login dialihkan ke /admin.

LAPORAN AKHIR
Tulis: rute yang dilindungi, rute yang dikecualikan, daftar Server Action beserta status pemeriksaan login masing-masing, dan hal yang perlu saya cek manual.
```

**Hasil:** Semua rute `/admin`, kecuali `/admin/login`, sekarang hanya bisa diakses setelah login. Perlindungan dibuat dua lapis.

- File baru: `proxy.js` di root proyek (Next.js 16 memakai nama `proxy`, bukan `middleware`), dengan matcher `/admin/:path*`. Proxy membuat klien Supabase dari `@supabase/ssr` dengan kunci publishable dan memeriksa pengguna dengan `getUser()` (bukan `getSession()`, karena `getSession` tidak memverifikasi token ke server).
- Aturan akses: belum login ke `/admin` atau `/admin/password` dialihkan ke `/admin/login`, sedangkan sudah login ke `/admin/login` dialihkan ke `/admin`. Cookie sesi yang diperbarui ikut terbawa di response, termasuk pada redirect.
- Lapisan kedua: setiap Server Action di `app/admin/actions.js` yang mengubah data memeriksa login di server dengan `getUser()` sebelum bekerja. Action `masuk` dikecualikan karena tugasnya memang membuat sesi.
- `CatatanBelumAktif` dihapus dari halaman `/admin`. Halaman publik (`/` dan `/produk/...`) tidak terkena proxy.
- Pengujian: di jendela penyamaran, `localhost:3000/admin` dan `localhost:3000/admin/password` langsung dialihkan ke halaman login. Setelah login, halaman admin terbuka normal.

**Perbaikan:** Tidak ada perbaikan besar yang diperlukan. Pengujian di jendela penyamaran juga diulang di link Vercel sebagai bagian dari cek keamanan akhir.

## US-07 List produk

**Prompt:** **[SENDIRI]**

```
KONTEKS
US-01 sampai US-06 sudah selesai: katalog publik dari Supabase, detail produk, tombol WhatsApp, login admin, ganti password, dan proteksi rute /admin lewat proxy.js. Halaman /admin (app/admin/page.jsx) adalah halaman daftar produk untuk admin, tetapi isinya belum diambil dari database. Proyek memakai Next.js 16 (App Router) dan Supabase.

PERSIAPAN (baca dulu, jangan ubah apa pun sebelum selesai membaca)
1. Baca AGENTS.md sampai habis, terutama aturan keamanan.
2. Baca docs/user-stories.md bagian US-07 beserta kriteria penerimaannya. Kalau kriteria di sana berbeda dari prompt ini, ikuti user story dan sebutkan perbedaannya di laporan.
3. Baca docs/schema.sql untuk mengetahui nama kolom tabel "produk" yang sebenarnya.
4. Baca app/admin/page.jsx, components/NavAdmin.jsx, dan komponen daftar atau tabel produk admin yang sudah ada (cari di folder components/). Perhatikan data atau markup contoh yang dipakai sekarang.
5. Baca lib/supabase/server.js (klien untuk membaca data) dan lib/supabase/auth.js (klien untuk memeriksa login), lalu pakai keduanya. Jangan membuat koneksi Supabase baru.

TUJUAN
Halaman /admin menampilkan daftar semua produk dari tabel "produk" di Supabase, di sisi server, hanya untuk admin yang sudah login.

LANGKAH KERJA
1. Jadikan app/admin/page.jsx Server Component async (tanpa "use client").
2. Lapisan keamanan tambahan: di awal halaman, panggil supabase.auth.getUser() lewat klien auth. Kalau tidak ada pengguna, panggil redirect("/admin/login"). Proxy sudah melindungi rute ini, tetapi halaman tidak boleh mengandalkan satu lapis saja.
3. Ambil data memakai klien server: .from("produk").select("*").order("id", { ascending: true }).
4. Tampilkan daftar:
   - Kolom atau bagian yang ditampilkan: foto (thumbnail), nama, kategori, dan harga dalam format rupiah. Tambahkan kolom lain dari tabel (misalnya stok atau status) hanya kalau ada di schema.sql dan relevan untuk admin.
   - Harga diformat dengan Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }) atau fungsi format yang sudah ada di proyek, supaya hasilnya "Rp 45.000".
   - Kalau sudah ada komponen atau markup daftar/tabel produk admin, pakai itu dan petakan kolom database ke props-nya. Jangan ubah tampilannya. Kalau belum ada, buat tabel sederhana dengan kelas dan warna dari DESIGN.md dan @theme di app/globals.css. Di layar HP, tabel harus tetap terbaca tanpa membuat halaman bergeser ke samping (misalnya tampil sebagai kartu atau tabel dengan wadah yang bisa digulir).
   - Tampilkan jumlah total produk di atas daftar, misalnya "6 produk".
   - Render foto dengan cara yang sama seperti KartuProduk merender fotonya, supaya konfigurasi gambar yang sudah ada tetap cocok.
5. Penanganan kondisi:
   a. Jika error: tampilkan pesan yang jelas dan ramah di halaman, misalnya "Gagal memuat daftar produk. Coba muat ulang halaman." Catat detail error dengan console.error di server saja.
   b. Jika data kosong: tampilkan teks "Belum ada produk".
   c. Jika ada data: render semua baris dengan key yang stabil (produk.id).
6. Pastikan halaman tidak di-cache statis: tambahkan export const dynamic = "force-dynamic".
7. Hapus data contoh dan CatatanBelumAktif yang menyebut US-07 dari halaman ini beserta import-nya. Jangan hapus file contoh kalau masih dipakai file lain.
8. Fitur ini hanya untuk menampilkan daftar. Jangan membuat fitur tambah, ubah, atau hapus produk. Kalau halaman sudah punya tombol seperti itu hanya sebagai tampilan, biarkan apa adanya dan sebutkan di laporan.

KEAMANAN
- Semua pengambilan data terjadi di server. Jangan jadikan kunci Supabase tersedia di browser dan jangan pakai awalan NEXT_PUBLIC_.
- Jangan membuat komponen client yang memanggil Supabase.
- Kalau kamu menambahkan Server Action apa pun, action itu wajib memeriksa login di server dengan getUser().

BATASAN KERAS
- Jangan ubah tampilan komponen yang sudah ada, jangan ubah proxy.js, dan jangan menjalankan perintah Git apa pun.
- Jangan membuat atau mengubah .env.local.

VERIFIKASI SEBELUM SELESAI
- Jalankan npm run lint dan npm run build, lalu perbaiki error dari perubahanmu.
- Telusuri secara logika empat kasus: belum login (diarahkan ke login), sudah login dengan data, tabel kosong, dan gagal ambil data.

LAPORAN AKHIR
Ringkas: file yang dibuat dan diubah, kolom yang ditampilkan, cara penanganan error dan data kosong, perbedaan dengan user story kalau ada, dan hal yang perlu saya cek manual.
```

**Hasil:** (isi setelah dikerjakan)

**Perbaikan:** (isi setelah dikerjakan)

## Debugging dan fitur bonus

### Error "SUPABASE_URL belum diatur" di halaman katalog (US-01)

**Gejala:** Halaman utama menampilkan error `SUPABASE_URL belum diatur`, ditelusuri ke `buatKlienServer` di `lib/supabase/server.js` yang dipanggil dari `app/page.jsx`.

**Penyebab:** `process.env.SUPABASE_URL` kosong saat aplikasi berjalan di laptop. Kodenya benar (pemeriksaan itulah yang memunculkan pesan jelas), masalahnya ada di konfigurasi `.env.local`.

**Perbaikan:** `npm run dev` dihentikan (Ctrl+C) lalu dijalankan lagi, karena Next.js hanya membaca `.env.local` saat start. Dipastikan juga `.env.local` ada di root proyek (sejajar `package.json`), namanya persis `.env.local`, isinya berformat `NAMA=nilai` tanpa spasi dan tanpa tanda kutip, dan file sudah disimpan.

### Error "SUPABASE_PUBLISHABLE_KEY belum diatur" di halaman login (US-04)

**Gejala:** Runtime Error di `/admin/login`: `SUPABASE_PUBLISHABLE_KEY belum diatur`, ditelusuri ke `buatKlienAuth` di `lib/supabase/auth.js` yang dipanggil dari `masuk` di `app/admin/actions.js`.

**Penyebab:** Sama seperti error sebelumnya: variabel `SUPABASE_PUBLISHABLE_KEY` tidak terbaca dari `.env.local`. Katalog sudah berjalan, jadi `SUPABASE_URL` dan `SUPABASE_SECRET_KEY` terbaca. Yang bermasalah hanya baris kunci publishable.

**Perbaikan:** Nama variabel dipastikan persis `SUPABASE_PUBLISHABLE_KEY` dan nilainya diisi dari Supabase → Project Settings → API Keys → Publishable key (berawalan `sb_publishable_`). File disimpan, lalu server dikembalikan dengan Ctrl+C dan `npm run dev`. Di Vercel, variabel yang sama dicek di Settings → Environment Variables lalu di-Redeploy.

### Peringatan TypeScript: Option 'baseUrl' is deprecated

**Gejala:** VS Code menampilkan peringatan `Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0`.

**Penyebab:** TypeScript 6 menandai opsi `baseUrl` di `jsconfig.json` atau `tsconfig.json` sebagai usang. Ini hanya peringatan editor, bukan error aplikasi.

**Perbaikan:** Ditambahkan `"ignoreDeprecations": "6.0"` di `compilerOptions`, atau `baseUrl` dihapus dan alias `paths` diawali `./`. Setelah itu TS Server di-restart lewat Ctrl+Shift+P → "TypeScript: Restart TS Server".
