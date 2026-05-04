# Qurban Story — Platform Digitalisasi Ibadah Qurban
### Fullstack Repository (Next.js 15 · Tailwind CSS · Prisma ORM · Midtrans · NextAuth)

**Qurban Story** adalah platform *e-commerce* dan sistem informasi khusus untuk pembelian serta penyaluran hewan qurban secara transparan. 
Proyek ini dikembangkan secara kolaboratif bersama **PT Saga (Saga Qurban)** untuk mendigitalisasi proses bisnis penjualan hewan qurban mereka, sekaligus menjadi bagian dari mata kuliah **Proyek Aplikasi Dasar (PAD) 2** Semester IV TRPL Universitas Gadjah Mada.

Repository ini berisi **seluruh implementasi Fullstack**, dengan fokus utama pada modul publik/customer, sistem autentikasi, integrasi *payment gateway*, dan manajemen database.

## 1. Tujuan Proyek

- Memfasilitasi umat muslim dalam melaksanakan ibadah qurban secara digital dengan mudah, aman, dan transparan.
- Menyediakan sistem patungan qurban (khususnya Sapi 1/7) dengan kalkulasi kuota otomatis.
- Mengintegrasikan *payment gateway* (Midtrans) untuk verifikasi pembayaran *real-time* dan otomatis.
- Menghadirkan dashboard pelaporan 3 tahap (Penyembelihan, Distribusi, Selesai) yang dapat dipantau langsung oleh *customer*.

## 2. Tim Pengembang

Proyek ini dikembangkan oleh Kelompok 2 PAD TRPL UGM:
- **Syakira Zahratul Firdaus** — Project Manager
- **Della Nurizki** — Developer (Fullstack)
- **Nawwaf Zayyan Musyafa (Zayyan)** — Developer (Fullstack)
- **Okta Alshina Arva Parahyta** — UI/UX Designer

## 3. Fokus Implementasi Developer (Della & Zayyan)

Pengembangan teknis dikerjakan secara kolaboratif (Della & Zayyan) mencakup seluruh siklus *development*, dengan *highlight* implementasi berikut:

### a. Autentikasi & Keamanan (NextAuth)
- Implementasi sistem Login dan Registrasi menggunakan **Google OAuth** dan *credentials*.
- Manajemen sesi pengguna (Login/Logout) dan proteksi *endpoint* menggunakan **JWT (Bearer Token)**.
- Implementasi *Role-Based Access Control* (RBAC) untuk memisahkan akses `CUSTOMER`, `ADMIN`, dan `SUPERADMIN`.

### b. Modul Publik & Customer
- **Katalog Produk:** Menampilkan pilihan hewan (Kambing, Domba, Sapi Full, Sapi 1/7 Patungan) dengan *badge* status kuota dan stok dinamis.
- **Dynamic Checkout:** Mendukung input dinamis nama *pequrban* (hingga 7 nama untuk sapi patungan) yang disimpan dengan *nested create* Prisma ORM untuk menghindari duplikasi data.
- **Dashboard Customer:** Ringkasan aktivitas pengguna, akses ke riwayat transaksi, dan profil akun.
- **Tracking Riwayat Transaksi:** Fitur pemantauan progres pelaporan 3 tahap secara transparan.
- **Invoice & Dokumentasi:** Akses riwayat pembayaran dan galeri foto/video bukti penyembelihan secara mandiri.

### c. Integrasi Payment Gateway (Midtrans)
- Implementasi **Midtrans Snap API** untuk *seamless checkout experience*.
- Mengelola *state* transaksi (Tertunda, Berhasil, Gagal, Kadaluarsa) via sinkronisasi API dan Webhook/Callback.
- Logika kedaluwarsa otomatis (24 jam) di sisi *backend* untuk mencegah *double booking* dan menjaga integritas stok.

### d. Arsitektur & Database System
- Menyusun arsitektur App Router pada Next.js dengan pemisahan *layout* `(public)` dan `(admin)`.
- Merancang relasi *database* menggunakan **Prisma ORM** dengan PostgreSQL (Supabase).

## 4. Tech Stack

| Kategori | Teknologi |
|---------|-----------|
| **Framework** | Next.js 15 (App Router), React |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma |
| **Auth** | NextAuth.js (Google Provider) |
| **Payment** | Midtrans (Snap & Core API) |
| **Deploy** | Vercel |

## 5. Instalasi & Konfigurasi
```bash
# 1. Clone repository
git clone [https://github.com/zerosuum/qurban-story.git](https://github.com/zerosuum/qurban-story.git)
cd qurban-story

# 2. Install dependencies
bun install

# 3. Generate Prisma Client & Push schema
bunx prisma generate
bunx prisma db push

# 4. Run development server
bun dev
```
Akses aplikasi via: `http://localhost:3000`

## 6. Environment Variables (.env)

Buat file `.env` di *root directory* dan sesuaikan nilainya:
```env
# Database Configuration (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[SUPABASE_ID].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[SUPABASE_ID].supabase.co:5432/postgres"

# Midtrans Configuration
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxx"
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxxxxxxx"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_super_secret_key"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```
Gantilah nilai `[PASSWORD]`, `[SUPABASE_ID]`, dan kunci API Midtrans dengan nilai yang sesuai.

## 7. Struktur Direktori Utama

```text
src/
 ├── app/(public)/       # Halaman Landing Page, Produk, Checkout, Riwayat
 ├── app/(admin)/        # Dashboard Admin, Manajemen Transaksi, Dokumentasi
 ├── app/api/            # API Routes (Midtrans Webhook, NextAuth, dll)
 ├── components/ui/      # Reusable UI Components
 ├── lib/                # Konfigurasi Prisma, NextAuth, Midtrans, dan Service Layer
 └── prisma/             # Schema Database
```

## 8. Kontak
Untuk kolaborasi lebih lanjut, silakan hubungi:
- **Della Nurizki** — [zerosuum](https://github.com/zerosuum)
- **Nawwaf Zayyan Musyafa** — [davudumon](https://github.com/davudumon)