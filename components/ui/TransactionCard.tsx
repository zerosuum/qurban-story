import React from "react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";

type TransactionCardProps = {
  productName: string;
  invoice: string;
  date: string;
  status:
    | "BERHASIL"
    | "KADALUARSA"
    | "MENUNGGU PEMBAYARAN"
    | "GAGAL"
    | "BELUM DIMULAI";
};

export default function TransactionCard({
  productName,
  invoice,
  date,
  status,
}: TransactionCardProps) {
  return (
    <Link href={`/riwayat-trx/${invoice}`} className="block w-full">
      <div
        className="
          flex justify-between items-center
          w-full
          p-6
          rounded-xl
          border border-neutral-100
          bg-white
          shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)]
          hover:shadow-md hover:border-primary-200 transition-all cursor-pointer
        "
      >
        {/* Bagian Kiri: Info Produk & Invoice */}
        <div className="flex flex-col gap-1 items-start w-full">
          {/* Nama Produk */}
          <h3 className="font-sans text-[18px] font-bold leading-[27px] text-neutral-900 w-full">
            {productName}
          </h3>

          {/* Invoice & Tanggal */}
          <div className="flex items-center gap-2 font-sans text-[16px] font-medium leading-[24px] text-neutral-900">
            <span>{invoice}</span>

            {/* Ellipse Pemisah (Sesuai SVG Figma) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className="flex-shrink-0"
            >
              <circle cx="5" cy="5" r="5" fill="#F3F3F3" />
            </svg>

            <span>{date}</span>
          </div>
        </div>

        {/* Bagian Kanan: Status Badge */}
        <StatusBadge status={status} />
      </div>
    </Link>
  );
}
