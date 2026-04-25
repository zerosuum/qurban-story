"use client";

import { signOut } from "next-auth/react";

type LogoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-800/50 backdrop-blur-sm p-4">
      <div
        className="
          flex flex-col items-end gap-4 
          w-full max-w-[480px] /* 🔥 FIX UTAMA: Pakai w-full dan max-w */
          p-5 sm:p-6 sm:px-8 
          bg-white border border-neutral-100 rounded-xl
          shadow-[0_8px_28px_-6px_rgba(24,39,75,0.12),0_18px_88px_-4px_rgba(24,39,75,0.14)]
          relative
        "
      >
        <button
          onClick={onClose}
          className="w-6 h-6 flex-shrink-0 hover:opacity-70 transition absolute top-5 right-5 sm:top-6 sm:right-8"
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
              id="mask0_527_7860"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="24"
              height="24"
            >
              <rect width="24" height="24" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_527_7860)">
              <path
                d="M8.4 17.0004L7 15.6004L10.6 12.0004L7 8.42539L8.4 7.02539L12 10.6254L15.575 7.02539L16.975 8.42539L13.375 12.0004L16.975 15.6004L15.575 17.0004L12 13.4004L8.4 17.0004Z"
                fill="#525252"
              />
            </g>
          </svg>
        </button>

        {/* Konten Teks Container */}
        <div className="flex flex-col items-start self-stretch gap-2 mt-6 sm:mt-8">
          {/* Judul Konfirmasi */}
          <h2 className="font-sans font-bold text-[16px] sm:text-[18px] leading-[20px] sm:leading-[24px] text-neutral-900">
            Konfirmasi
          </h2>
          {/* Teks Peringatan */}
          <p className="font-sans font-normal text-[14px] sm:text-[16px] leading-[22px] sm:leading-[24px] text-neutral-900">
            Apakah Anda yakin ingin keluar dari akun?
          </p>
        </div>

        {/* Action Buttons Container */}
        <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-3 sm:gap-4 w-full mt-4">
          <button
            onClick={onClose}
            className="flex justify-center items-center h-[44px] w-full sm:w-auto px-6 py-2 gap-2.5 rounded-xl border border-primary-500 text-primary-500 font-sans font-semibold hover:bg-neutral-50 hover:text-primary-600 hover:border-primary-600 active:scale-95 transition-all duration-200 flex-1"
          >
            Batal
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex justify-center items-center h-[44px] w-full sm:w-auto px-6 py-2 gap-2.5 rounded-xl bg-primary-500 text-white font-sans font-semibold hover:bg-primary-600 hover:shadow-md hover:shadow-neutral-200 active:scale-95 transition-all duration-200 flex-1"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
