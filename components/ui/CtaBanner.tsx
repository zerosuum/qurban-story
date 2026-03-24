import React from "react";
import Link from "next/link";

export default function CtaBanner() {
  return (
    <div
      className="relative overflow-hidden flex flex-row justify-between items-center w-full max-w-249 h-40 p-6 rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),0_4px_6px_-4px_rgba(0,0,0,0.10)]"
      style={{ background: "linear-gradient(90deg, #044B57 0%, #021E23 100%)" }}
    >
      {/* Abstract Pattern Kiri Bawah */}
      <div className="absolute -left-10 -bottom-10 w-16 h-16 rounded-full bg-primary-400" />

      {/* Abstract Pattern Kanan Atas */}
      <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-primary-400" />

      {/* Teks Content */}
      <div className="flex flex-col justify-center gap-2 relative z-10 w-192.25">
        <h2 className="font-sans text-[24px] font-bold text-white leading-8">
          Niat baik, langkah yang berkah.
        </h2>
        <p className="font-sans text-[16px] font-normal text-white/80 leading-6">
          Pilih hewan qurban terbaik Anda tahun ini dan biarkan kami membantu
          mengelola amanah Anda dengan tepat.
        </p>
      </div>

      {/* Tombol CTA */}
      <Link
        href="/produk"
        className="relative z-10 flex justify-center items-center gap-2.5 h-12 px-4 py-2 rounded-xl bg-secondary-500 text-white text-center font-sans font-bold text-[16px] leading-6 hover:bg-secondary-600 active:scale-95 transition-all"
      >
        Cari Hewan
      </Link>
    </div>
  );
}
