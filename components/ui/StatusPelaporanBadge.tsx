export type PelaporanStatus =
    | "Tahap 1/3"
    | "Tahap 2/3"
    | "Selesai"
    | "Belum Dimulai";

type StatusPelaporanBadgeProps = {
    status: PelaporanStatus | string;
    size?: "sm" | "md" | "lg";
};

export default function StatusPelaporanBadge({
    status,
    size = "md",
}: StatusPelaporanBadgeProps) {
    const sizeStyles = {
        sm: "px-4 py-1 text-[12px] leading-[18px]",
        md: "px-6 py-1 text-[16px] leading-[24px]",
        lg: "px-6 py-2 text-[18px] leading-[27px]",
    };

    const colorStyles: Record<string, string> = {
        "Tahap 1/3": "bg-white text-[#2980B9] border border-[#2980B9]",
        "Tahap 2/3": "bg-white text-[#2980B9] border border-[#2980B9]",
        Selesai: "bg-white text-[#2D6A4F] border border-[#2D6A4F]",
        "Belum Dimulai": "bg-white text-neutral-500 border border-neutral-300",
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
