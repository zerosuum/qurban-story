import React from "react";

export type BadgeStatus =
  // Status Transaksi (Solid)
  | "BERHASIL"
  | "MENUNGGU PEMBAYARAN"
  | "TERTUNDA"
  | "GAGAL"
  | "KADALUARSA"
  // Tahap Pelaporan (Outline)
  | "Tahap 1/3"
  | "Tahap 2/3"
  | "Selesai"
  | "Belum Dimulai";

type StatusBadgeProps = {
  status: BadgeStatus | string; 
  size?: "sm" | "md" | "lg";
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  // 1. Mapping Ukuran Sesuai CSS Figma Lu
  const sizeStyles = {
    sm: "px-4 py-1 text-[12px] leading-[18px]", // py 4px, px 16px (small)
    md: "px-6 py-1 text-[16px] leading-[24px]", // py 4px, px 24px (Normal)
    lg: "px-6 py-2 text-[18px] leading-[27px]", // py 8px, px 24px (Large)
  };

  // 2. Mapping Warna Sesuai Variabel Semantic Figma Lu
  const colorStyles: Record<string, string> = {
    /* --- BADGE TRANSAKSI (SOLID) --- */
    BERHASIL: "bg-[#2D6A4F] text-[#EBF5FB] border border-transparent", // Success Base
    GAGAL: "bg-[#A63A3A] text-[#FCEAEA] border border-transparent", // Error Base
    KADALUARSA: "bg-[#E67E22] text-[#FFF4E5] border border-transparent", // Warning Base
    "MENUNGGU PEMBAYARAN":
      "bg-[#2980B9] text-[#EBF5FB] border border-transparent", // Info Base
    TERTUNDA: "bg-[#2980B9] text-[#EBF5FB] border border-transparent",

    /* --- BADGE PELAPORAN (OUTLINE) --- */
    "Tahap 1/3": "bg-white text-[#2980B9] border border-[#2980B9]", // Info Outline
    "Tahap 2/3": "bg-white text-[#2980B9] border border-[#2980B9]",
    Selesai: "bg-white text-[#2D6A4F] border border-[#2D6A4F]", // Success Outline
    "Belum Dimulai": "bg-white text-neutral-500 border border-neutral-300", // Neutral Outline
  };

  const appliedColor =
    colorStyles[status as string] ||
    "bg-neutral-100 text-neutral-600 border border-neutral-200";

  return (
    <div
      className={`
        inline-flex items-center justify-center gap-2.5
        rounded-full font-sans font-medium
        transition-colors duration-200
        ${sizeStyles[size]}
        ${appliedColor}
      `}
    >
      {status}
    </div>
  );
}
