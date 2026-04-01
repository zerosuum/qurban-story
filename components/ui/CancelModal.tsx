"use client";
import React from "react";
import Link from "next/link";

type CancelModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CancelModal({ isOpen, onClose }: CancelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-800/50 backdrop-blur-sm">
      {/* Modal Container */}
      <div
        className="
          flex flex-col items-end gap-4 
          w-[480px] p-6 px-8 
          bg-white border border-neutral-100 rounded-xl
          shadow-[0_8px_28px_-6px_rgba(24,39,75,0.12),0_18px_88px_-4px_rgba(24,39,75,0.14)]
          relative
        "
      >
        {/* Tombol X (Close) */}
        <button
          onClick={onClose}
          className="w-6 h-6 flex-shrink-0 hover:opacity-70 transition absolute top-6 right-8"
          aria-label="Tutup"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <mask
              id="mask0_698_5902"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="24"
              height="24"
            >
              <rect width="24" height="24" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_698_5902)">
              <path
                d="M8.4 17.0004L7 15.6004L10.6 12.0004L7 8.42539L8.4 7.02539L12 10.6254L15.575 7.02539L16.975 8.42539L13.375 12.0004L16.975 15.6004L15.575 17.0004L12 13.4004L8.4 17.0004Z"
                fill="#525252"
              />
            </g>
          </svg>
        </button>

        {/* Konten Teks Container */}
        <div className="flex flex-col items-start self-stretch gap-4 mt-8 w-full">
          {/* Judul Konfirmasi */}
          <h2 className="font-sans font-bold text-[16px] leading-[20px] text-neutral-900 w-full">
            Konfirmasi
          </h2>
          {/* Teks Peringatan */}
          <p className="font-sans font-normal text-[16px] leading-[24px] text-neutral-900 w-full">
            Apakah Anda yakin ingin membatalkan transaksi?
          </p>
        </div>

        {/* Action Buttons Container */}
        <div className="flex justify-end items-center gap-4 w-full mt-2">
          {/* Tombol Tutup (Batal) Modal */}
          <button
            onClick={onClose}
            className="flex justify-center items-center h-10 px-4 py-2 gap-2.5 rounded-xl border border-primary-500 text-primary-600 font-sans font-bold text-[16px] leading-[24px] hover:bg-neutral-50 hover:text-primary-700 active:scale-95 transition-all duration-200 flex-1"
          >
            Kembali
          </button>
          {/* Tombol Eksekusi: Ya, Batalkan (Redirect ke Produk) */}
          <Link
            href="/produk"
            className="flex justify-center items-center h-10 px-4 py-2 gap-2.5 rounded-xl bg-primary-500 text-white font-sans font-bold text-[16px] leading-[24px] hover:bg-primary-600 hover:shadow-md active:scale-95 transition-all duration-200 flex-1"
          >
            Ya, Batalkan
          </Link>
        </div>
      </div>
    </div>
  );
}
