import React from "react";

// Bikin sub-komponen kecil biar kodenya rapi dan nggak diulang-ulang
const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-start gap-2 flex-1 min-w-[200px]">
    <span className="font-sans text-[16px] font-normal leading-[24px] text-neutral-900">
      {label}
    </span>
    <span className="font-sans text-[16px] font-semibold leading-[24px] text-neutral-900">
      {value}
    </span>
  </div>
);

export default function TransactionDetailCard() {
  return (
    // Container Utama (w: 792px, p: 24px, gap: 24px, rounded: 12px, border, shadow)
    <div className="flex flex-col items-start w-full max-w-[792px] p-6 gap-6 rounded-xl border border-neutral-200 bg-white shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)]">
      {/* Header Card (Judul & Tombol Invoice) */}
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col items-start gap-2">
          {/* Judul: 20px, Bold */}
          <h2 className="font-sans text-[20px] font-bold leading-[26px] text-neutral-900">
            Detail Transaksi
          </h2>
          {/* Invoice: 18px, Medium */}
          <p className="font-sans text-[18px] font-medium leading-[27px] text-neutral-900 mt-2">
            INV-2026-001
          </p>
          {/* Tanggal: 16px, Regular */}
          <p className="font-sans text-[16px] font-normal leading-[24px] text-neutral-900">
            15 Maret 2026, 10.30 WIB
          </p>
        </div>

        {/* Tombol Lihat Invoice (Sesuai gambar: Outline Button) */}
        <button className="flex justify-center items-center h-10 px-4 py-2 rounded-xl border border-primary-500 text-primary-600 font-sans font-semibold hover:bg-primary-50 transition-colors">
          Lihat Invoice
        </button>
      </div>

      {/* Grid Data (3 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 w-full mt-2">
        {/* Baris 1 */}
        <DetailItem label="Nama Pequrban" value="Siti Aisyah" />
        <DetailItem label="Kode Hewan" value="KMB-001" />
        <DetailItem label="Metode Pembayaran" value="BCA Virtual Account" />

        {/* Baris 2 */}
        <DetailItem label="Nama yang Berqurban" value="Siti Aisyah" />
        <DetailItem label="Produk" value="Kambing Premium" />
        <DetailItem label="Harga" value="Rp. 3.200.000" />
      </div>
    </div>
  );
}
