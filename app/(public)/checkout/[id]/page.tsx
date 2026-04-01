"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckoutNiat,
  CheckoutMetode,
  CheckoutTotal,
  CheckoutQuotaInput,
} from "@/components/ui/CheckoutCards";
import CancelModal from "@/components/ui/CancelModal";

export default function CheckoutPage() {
  // State untuk modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-white flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-[792px] flex flex-col gap-6">
        {/* Header & Tombol Kembali */}
        <div className="flex flex-col gap-4">
          {/* Tombol kembali pakai span biasa, trus klikny trigger ke Modal */}
          <Link
            href="/produk"
            className="flex items-center gap-2 w-full px-0 pt-6 pb-2 text-primary-600 font-bold text-[16px] leading-6"
          >
            {/* ICON */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0"
            >
              <mask
                id="mask0_back"
                style={{ maskType: "alpha" }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="24"
                height="24"
              >
                <rect width="24" height="24" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_back)">
                <path
                  d="M10 18L4 12L10 6L11.4 7.45L7.85 11H20V13H7.85L11.4 16.55L10 18Z"
                  fill="#033C46"
                />
              </g>
            </svg>
            <span>Kembali</span>
          </Link>
          <h1 className="font-sans text-[24px] md:text-[32px] font-bold text-neutral-900">
            Checkout
          </h1>
        </div>

        {/* 1. CARD: SUMMARY HEWAN */}
        <div className="flex items-center gap-4 w-full p-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-neutral-100">
            {/* To do: ganti src ini pakai data dinamis nanti */}
            <Image
              src="/hewan/sapi.png"
              alt="Sapi Limosin"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-sans text-[18px] font-bold text-neutral-900">
              Sapi Limosin (Patungan)
            </h3>
            <p className="font-sans text-[14px] text-neutral-600">
              Berat 350-400 kg
            </p>
            <p className="font-sans text-[18px] font-bold text-primary-600 mt-1">
              Rp. 4.000.000
            </p>
          </div>
        </div>

        {/* 2. CARD: DATA PEQURBAN */}
        <div className="flex flex-col items-start w-full p-4 px-6 gap-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
          <h2 className="font-sans text-[18px] font-bold text-neutral-900 w-full">
            Data Pequrban
          </h2>

          <div className="flex flex-col gap-1 w-full">
            <label className="font-sans text-[14px] font-medium text-neutral-900">
              Nama Pequrban/Donatur
            </label>
            <input
              type="text"
              defaultValue="Siti Aisyah"
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[14px] text-neutral-900 outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="font-sans text-[14px] font-medium text-neutral-900">
              Nomor Telepon
            </label>
            <input
              type="text"
              placeholder="081233445566"
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[14px] text-neutral-900 outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="font-sans text-[14px] font-medium text-neutral-900">
              Email
            </label>
            <input
              type="email"
              defaultValue="siti@example.com"
              disabled
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[14px] text-neutral-500 bg-neutral-50 outline-none"
            />
            <p className="font-sans text-[12px] text-neutral-400">
              Otomatis terisi dari akun Anda.
            </p>
          </div>
        </div>

        {/* 3. CARD: INPUT QUOTA NAMA PATUNGAN */}
        <CheckoutQuotaInput maxQuota={7} />

        {/* 4. CARD: CATATAN NIAT */}
        <CheckoutNiat />

        {/* 5. CARD: METODE PEMBAYARAN */}
        <CheckoutMetode />

        {/* 6. BOTTOM SECTION: TOTAL & BUTTONS */}
        <div className="flex flex-col gap-4 mt-2">
          <CheckoutTotal total="Rp. 4.000.000" />

          <div className="flex gap-4 w-full">
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="flex-1 flex justify-center items-center h-[40px] px-4 py-2 gap-2.5 rounded-xl bg-neutral-200 text-[#000000] font-bold text-[16px] hover:bg-neutral-300 transition-colors"
            >
              Batalkan
            </button>
            <button className="flex-1 flex justify-center items-center h-[40px] px-4 py-2 gap-2.5 rounded-xl bg-primary-600 text-white font-bold text-[16px] hover:bg-primary-700 active:scale-95 transition-all">
              Bayar Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
}
