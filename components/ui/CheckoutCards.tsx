"use client";
import React, { useState } from "react";

// --- CARD: CATATAN NIAT ---
export function CheckoutNiat({ nama = "" }: { nama?: string }) {
  const [selectedNiat, setSelectedNiat] = useState<"sendiri" | "orang-lain">("sendiri");
  
  const displayName = nama.trim() !== "" ? nama : "[nama]";

  return (
    <div className="flex flex-col items-start w-full max-w-[792px] p-6 gap-6 rounded-xl border border-neutral-200 bg-white shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)]">
      <h2 className="font-sans text-[18px] font-bold leading-[27px] text-neutral-900">
        Catatan Niat
      </h2>

      <div className="flex flex-col w-full gap-4">
        {/* Opsi 1: Diri Sendiri */}
        <div 
          onClick={() => setSelectedNiat("sendiri")}
          className="flex flex-col gap-2 w-full cursor-pointer group"
        >
          {/* Teks Judul */}
          <p className="font-sans text-[16px] font-normal leading-[24px] text-[#292929]">
            Niat Qurban untuk Diri Sendiri
          </p>
          
          {/* Kotak Kuning */}
          <div className={`flex flex-col justify-center w-full min-h-[32px] p-4 px-4 py-3 rounded-lg transition-all ${
            selectedNiat === "sendiri" 
              ? "bg-[#FEF1DA] border border-[#E67E22]" 
              : "bg-[#FEF1DA]/40 border border-transparent group-hover:bg-[#FEF1DA]/70"
          }`}>
            <p className="font-sans text-[16px] font-normal italic leading-[24px] text-neutral-900">
              “Saya niat berkurban sunnah untuk diri saya sendiri karena Allah.”
            </p>
          </div>
        </div>

        {/* Opsi 2: Orang Lain */}
        <div 
          onClick={() => setSelectedNiat("orang-lain")}
          className="flex flex-col gap-2 w-full cursor-pointer group mt-2"
        >
          {/* Teks Judul */}
          <p className="font-sans text-[16px] font-normal leading-[24px] text-[#292929]">
            Niat Qurban Untuk Orang Lain/Mewakilkan
          </p>
          
          {/* Kotak Kuning */}
          <div className={`flex flex-col justify-center w-full min-h-[32px] p-4 px-4 py-3 rounded-lg transition-all ${
            selectedNiat === "orang-lain" 
              ? "bg-[#FEF1DA] border border-[#E67E22]" 
              : "bg-[#FEF1DA]/40 border border-transparent group-hover:bg-[#FEF1DA]/70"
          }`}>
            <p className="font-sans text-[16px] font-normal italic leading-[24px] text-neutral-900">
              “Saya niat berkurban sunnah untuk {displayName} karena Allah.”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- CARD: METODE PEMBAYARAN ---
export function CheckoutMetode() {
  return (
    <div className="flex flex-col items-start w-full max-w-[792px] p-4 px-6 gap-2.5 rounded-xl border border-neutral-200 bg-white shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)]">
      <h2 className="font-sans text-[18px] font-bold leading-[27px] text-neutral-900 text-center">
        Metode Pembayaran
      </h2>
      <p className="font-sans text-[16px] font-normal leading-[24px] text-neutral-900 min-h-[32px] flex items-center">
        Anda akan diarahkan ke halaman pembayaran resmi Midtrans untuk memilih
        metode pembayaran.
      </p>
      <div className="flex items-center w-full h-[36px] px-2 py-1.5 gap-2">
        {/* Shield Icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="shrink-0"
        >
          <mask
            id="mask_shield"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="16"
            height="16"
          >
            <rect width="16" height="16" fill="#D9D9D9" />
          </mask>
          <g mask="url(#mask_shield)">
            <path
              d="M7.30008 10.3666L11.0667 6.59992L10.1167 5.64992L7.30008 8.46658L5.90008 7.06659L4.95008 8.01659L7.30008 10.3666ZM8.00008 14.6666C6.45564 14.2777 5.18064 13.3916 4.17508 12.0083C3.16953 10.6249 2.66675 9.08881 2.66675 7.39992V3.33325L8.00008 1.33325L13.3334 3.33325V7.39992C13.3334 9.08881 12.8306 10.6249 11.8251 12.0083C10.8195 13.3916 9.54453 14.2777 8.00008 14.6666ZM8.00008 13.2666C9.15564 12.8999 10.1112 12.1666 10.8667 11.0666C11.6223 9.96659 12.0001 8.74436 12.0001 7.39992V4.24992L8.00008 2.74992L4.00008 4.24992V7.39992C4.00008 8.74436 4.37786 9.96659 5.13341 11.0666C5.88897 12.1666 6.84453 12.8999 8.00008 13.2666Z"
              fill="#8A6729"
            />
          </g>
        </svg>
        <p className="font-sans text-[12px] font-normal leading-[18px] text-[#8A6729]">
          Pembayaran diproses melalui sistem pembayaran aman Midtrans.
        </p>
      </div>
    </div>
  );
}

// --- CARD: TOTAL PEMBAYARAN ---
export function CheckoutTotal({ total }: { total: string }) {
  return (
    <div className="flex justify-between items-center w-full max-w-[792px] p-6 rounded-xl bg-secondary-100 shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)]">
      <span className="font-sans text-[18px] font-bold leading-[27px] text-neutral-900 text-center">
        Total Pembayaran
      </span>
      <span className="font-sans text-[20px] font-bold leading-[26px] text-primary-500">
        {total}
      </span>
    </div>
  );
}

// --- CARD: NAMA YANG BERQURBAN (QUOTA PATUNGAN) ---
export function CheckoutQuotaInput({ maxQuota = 1 }: { maxQuota?: number }) {
  const [names, setNames] = useState<string[]>([""]);

  const addName = () => {
    if (names.length < maxQuota) setNames([...names, ""]);
  };

  const removeName = (indexToRemove: number) => {
    if (names.length > 1) {
      setNames(names.filter((_, idx) => idx !== indexToRemove));
    }
  };

  const updateName = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  return (
    <div className="flex flex-col items-start w-full max-w-[792px] p-4 px-6 gap-2.5 rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex justify-between items-center w-full">
        <h2 className="font-sans text-[18px] font-bold leading-[27px] text-neutral-900">
          Nama yang Berqurban
        </h2>

        {/* Tombol tambah hanya muncul kalau ini produk patungan (maxQuota > 1) */}
        {maxQuota > 1 && (
          <button
            onClick={addName}
            disabled={names.length >= maxQuota}
            className="flex justify-center items-center h-10 px-4 py-2 gap-2.5 rounded-xl border border-neutral-300 disabled:opacity-50 transition-colors hover:bg-neutral-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M11 13H5V11H11V5H13V11H19V13H13V19H11V13Z"
                fill="#033C46"
              />
            </svg>
            <span className="font-sans text-[16px] font-bold text-primary-600">
              Tambah
            </span>
          </button>
        )}
      </div>

      <p className="font-sans text-[16px] font-normal leading-[24px] text-neutral-900">
        {maxQuota > 1
          ? `Masukkan nama orang yang akan berqurban (maksimal ${maxQuota} orang)`
          : "Masukkan nama orang yang akan berqurban"}
      </p>

      <div className="flex flex-col w-full gap-2 mt-2">
        {names.map((name, idx) => (
          <div
            key={idx}
            className="flex items-center w-full h-[36px] px-2 py-1.5 gap-2 border border-neutral-200 rounded-lg"
          >
            <input
              type="text"
              placeholder={
                maxQuota > 1 ? `Nama ke-${idx + 1}` : "Masukkan nama"
              }
              value={name}
              onChange={(e) => updateName(idx, e.target.value)}
              className="flex-1 bg-transparent outline-none font-sans text-[14px] text-neutral-900 placeholder:text-neutral-400"
            />
            {/* Icon hapus hanya muncul kalau lebih dari 1 input */}
            {names.length > 1 && (
              <button
                onClick={() => removeName(idx)}
                className="w-4 h-4 shrink-0 hover:opacity-70 transition-opacity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M4.6665 14C4.29984 14 3.98595 13.8694 3.72484 13.6083C3.46373 13.3472 3.33317 13.0333 3.33317 12.6667V4H2.6665V2.66667H5.99984V2H9.99984V2.66667H13.3332V4H12.6665V12.6667C12.6665 13.0333 12.5359 13.3472 12.2748 13.6083C12.0137 13.8694 11.6998 14 11.3332 14H4.6665ZM11.3332 4H4.6665V12.6667H11.3332V4ZM5.99984 11.3333H7.33317V5.33333H5.99984V11.3333ZM8.6665 11.3333H9.99984V5.33333H8.6665V11.3333Z"
                    fill="#A63A3A"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}