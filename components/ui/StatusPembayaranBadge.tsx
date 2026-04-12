export type PembayaranStatus =
  | "BERHASIL"
  | "MENUNGGU PEMBAYARAN"
  | "GAGAL"
  | "KADALUARSA"
  | "BELUM DIMULAI";

type StatusPembayaranBadgeProps = {
  status: PembayaranStatus | string;
  size?: "sm" | "md" | "lg";
};

export default function StatusPembayaranBadge({
  status,
  size = "md",
}: StatusPembayaranBadgeProps) {
  const sizeStyles = {
    sm: "px-4 py-1 text-[12px] leading-[18px]",
    md: "px-6 py-1 text-[16px] leading-[24px]",
    lg: "px-6 py-2 text-[18px] leading-[27px]",
  };

  const colorStyles: Record<string, string> = {
    BERHASIL: "bg-[#2D6A4F] text-[#EBF5FB] border border-transparent",
    GAGAL: "bg-[#A63A3A] text-[#FCEAEA] border border-transparent",
    KADALUARSA: "bg-[#E67E22] text-[#FFF4E5] border border-transparent",
    "MENUNGGU PEMBAYARAN":
      "bg-[#2980B9] text-[#EBF5FB] border border-transparent",
    "BELUM DIMULAI": "bg-white text-neutral-500 border border-neutral-300",
  };

  const appliedColor =
    colorStyles[status as string] ||
    "bg-neutral-100 text-neutral-600 border border-neutral-200";

  return (
    <div
      className={`
        inline-flex items-center justify-center gap-2.5
        rounded-full font-sans font-medium whitespace-nowrap
        transition-colors duration-200
        ${sizeStyles[size]}
        ${appliedColor}
      `}
    >
      {status === "TERTUNDA" ? "MENUNGGU PEMBAYARAN" : status}
    </div>
  );
}
