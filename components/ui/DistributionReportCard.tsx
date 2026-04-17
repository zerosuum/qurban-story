"use client";

export default function DistributionReportCard({ status = "Belum Dimulai" }: { status?: string }) {
  
  const isSelesai = status === "Selesai";

  return (
    <div className="flex flex-col w-full max-w-[792px] px-6 py-4 rounded-xl border border-neutral-200 bg-white shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)] gap-3">
      {/* Title */}
      <h2 className="text-[20px] font-bold leading-[26px] text-neutral-900 text-center w-full">
        Laporan Distribusi
      </h2>

      {/* Box Notifikasi */}
      <div 
        className={`flex w-full px-3 py-3 rounded-lg border ${
          isSelesai 
            ? "bg-[#E6F4EE] border-[#6CA58C]" 
            : "bg-[#FEF1DA] border-[#FEF1DA]"
        }`}
      >
        <p 
          className={`text-[16px] italic leading-[24px] ${
            isSelesai ? "text-[#2E6B53] font-medium" : "text-neutral-900"
          }`}
        >
          {isSelesai
            ? "Alhamdulillah, daging qurban Anda telah selesai didistribusikan kepada penerima manfaat yang berhak."
            : "Laporan distribusi akan tersedia setelah Tahap 2 selesai. Laporan mencakup detail penerima manfaat dan jumlah distribusi."}
        </p>
      </div>

      {/* Footer Text */}
      <p className="text-[16px] italic leading-[24px] text-neutral-500 text-center w-full">
        Dokumentasi akan diperbarui setelah setiap tahap selesai.
      </p>
    </div>
  );
}