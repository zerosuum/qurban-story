"use client";

import React from "react";
import Link from "next/link";

export default function CtaBanner() {
  return (
    <div
      className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center w-full max-w-[996px] min-h-[160px] p-6 gap-6 md:gap-0 rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),0_4px_6px_-4px_rgba(0,0,0,0.10)]"
      style={{ background: "linear-gradient(90deg, #044B57 0%, #021E23 100%)" }}
    >
      {/* Abstract Pattern Kiri Bawah */}
      <div
        className="absolute -left-[40px] -bottom-[40px] w-[128px] h-[128px] rounded-full opacity-40 pointer-events-none"
        style={{ backgroundColor: "#1F6B78" }}
      />

      {/* Abstract Pattern Kanan Atas */}
      <div
        className="absolute -right-[80px] -top-[80px] w-[256px] h-[256px] rounded-full opacity-40 pointer-events-none"
        style={{ backgroundColor: "#1F6B78" }}
      />

      {/* Teks Content */}
      <div className="flex flex-col justify-center gap-2 relative z-10 w-full md:max-w-[70%]">
        <h2 className="font-sans text-[20px] md:text-[24px] font-bold text-white leading-[28px] md:leading-8">
          Niat baik, langkah yang berkah.
        </h2>
        <p className="font-sans text-[14px] md:text-[16px] font-normal text-white/80 leading-[22px] md:leading-6">
          Pilih hewan qurban terbaik Anda tahun ini dan biarkan kami membantu
          mengelola amanah Anda dengan tepat.
        </p>
      </div>

      {/* Tombol CTA */}
      <Link
        href="/produk"
        className="relative z-10 flex justify-center items-center gap-2.5 h-12 w-full md:w-auto shrink-0 px-6 py-2 rounded-xl bg-secondary-500 text-white text-center font-sans font-bold text-[16px] leading-6 hover:bg-secondary-600 active:scale-95 transition-all"
      >
        Cari Hewan
      </Link>
    </div>
  );
}
