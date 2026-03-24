"use client";

export default function DistributionReportCard() {
  return (
    <div className="flex flex-col w-full max-w-[792px] px-6 py-4 rounded-xl border border-neutral-200 bg-white shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)] gap-3">
      {/* Title */}
      <h2 className="text-[20px] font-bold leading-[26px] text-neutral-900 text-center w-full">
        Laporan Distribusi
      </h2>

      {/* Box Kuning */}
      <div className="flex w-full px-3 py-3 rounded-lg bg-[#FEF1DA] border border-neutral-100">
        <p className="text-[16px] italic leading-[24px] text-neutral-900">
          Laporan distribusi akan tersedia setelah Tahap 2 selesai. Laporan
          mencakup detail penerima manfaat dan jumlah distribusi.
        </p>
      </div>

      {/* Footer Text */}
      <p className="text-[16px] italic leading-[24px] text-neutral-500 text-center w-full">
        Dokumentasi akan diperbarui setelah setiap tahap selesai.
      </p>
    </div>
  );
}
