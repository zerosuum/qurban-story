import React from "react";
import Link from "next/link";

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

type TransactionDetailCardProps = {
  id: string;
  invoice: string;
  tanggal: string;
  pequrban: string;
  kodeHewan: string;
  metodePembayaran: string;
  namaBerqurban: string;
  produk: string;
  harga: string;
};

export default function TransactionDetailCard({
  id,
  invoice,
  tanggal,
  pequrban,
  kodeHewan,
  metodePembayaran,
  namaBerqurban,
  produk,
  harga,
}: TransactionDetailCardProps) {
  return (
    <div className="flex flex-col items-start w-full max-w-[792px] p-6 gap-6 rounded-xl border border-neutral-200 bg-white shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)]">
      {/* Header Card */}
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col items-start gap-2">
          <h2 className="font-sans text-[20px] font-bold leading-[26px] text-neutral-900">
            Detail Transaksi
          </h2>
          <p className="font-sans text-[18px] font-medium leading-[27px] text-neutral-900 mt-2">
            {invoice}
          </p>
          <p className="font-sans text-[16px] font-normal leading-[24px] text-neutral-900">
            {tanggal}
          </p>
        </div>

        <Link
          href={`/invoice/${id}`}
          className="group flex justify-center items-center h-10 px-4 py-2 gap-2.5 rounded-xl border border-primary-500 text-primary-600 hover:bg-neutral-50 hover:text-primary-600 hover:border-primary-600 active:scale-95 transition-all duration-200"
        >
          <span className="font-sans font-bold text-[16px]">Lihat Invoice</span>
        </Link>
      </div>

      {/* Grid Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 w-full mt-2">
        <DetailItem label="Nama Pequrban" value={pequrban} />
        <DetailItem label="Kode Hewan" value={kodeHewan} />
        <DetailItem label="Metode Pembayaran" value={metodePembayaran} />

        <DetailItem label="Nama yang Berqurban" value={namaBerqurban} />
        <DetailItem label="Produk" value={produk} />
        <DetailItem label="Harga" value={harga} />
      </div>
    </div>
  );
}
