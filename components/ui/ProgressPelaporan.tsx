import React from "react";

type StepStatus = "success" | "pending" | "error";

type ProgressStepProps = {
  tahap: string;
  judul: string;
  deskripsi: string;
  tanggal?: string;
  status: StepStatus;
  isLast?: boolean;
};

// Sub-komponen buat per-tahapan
const ProgressStep = ({
  tahap,
  judul,
  deskripsi,
  tanggal,
  status,
  isLast,
}: ProgressStepProps) => {
  // Mapping class background dan path gambar berdasarkan status
  let bgIconClass = "";
  let iconSrc = "";

  if (status === "success") {
    bgIconClass = "bg-semantic-success-subtle bg-[#E9F5EE]";
    iconSrc = "/icons/progress-check.svg";
  } else if (status === "pending") {
    bgIconClass = "bg-semantic-warning-subtle bg-[#FFF4E5]";
    iconSrc = "/icons/progress-clock.svg";
  } else if (status === "error") {
    bgIconClass = "bg-semantic-error-subtle bg-[#FCEAEA]";
    iconSrc = "/icons/progress-cross.svg";
  }

  return (
    <div className="flex items-start gap-4 w-full">
      {/* Kolom Kiri: Icon & Garis Vertikal */}
      <div className="flex flex-col items-center">
        {/* Container Icon (w: 48px, h: 48px, p: 4px, rounded-full) */}
        <div
          className={`flex w-12 h-12 p-1 items-start gap-[10px] rounded-full shrink-0 ${bgIconClass}`}
        >
          <img
            src={iconSrc}
            alt={`Status ${status}`}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Garis Vertikal penyambung (jangan dimunculin di item terakhir) */}
        {!isLast && (
          <div className="w-0.5 min-h-[40px] h-full bg-neutral-200 mt-2 mb-2 flex-grow" />
        )}
      </div>

      {/* Kolom Kanan: Teks Konten */}
      <div
        className={`flex flex-col items-start self-stretch w-full ${!isLast ? "pb-6" : ""}`}
      >
        {/* Judul Tahapan (16px, Medium, lh: 24px) */}
        <h3 className="font-sans text-[16px] font-medium leading-[24px] text-neutral-900 self-stretch">
          Tahap {tahap}: {judul}
        </h3>

        {/* Deskripsi (12px, Regular, lh: 18px) */}
        <p className="font-sans text-[12px] font-normal leading-[18px] text-neutral-900 self-stretch mt-1">
          {deskripsi}
        </p>

        {/* Tanggal (12px, Regular, lh: 18px) */}
        <p className="font-sans text-[12px] font-normal leading-[18px] text-neutral-900 self-stretch mt-1">
          {tanggal || "-"}
        </p>
      </div>
    </div>
  );
};

export default function ProgressPelaporan() {
  return (
    // Container Utama (w: 792px, p: 24px, rounded: 12px, border, shadow)
    <div className="flex flex-col items-start w-full max-w-[792px] p-6 rounded-xl border border-neutral-200 bg-white shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)]">
      {/* Judul Box */}
      <h2 className="font-sans text-2xl font-bold leading-[26px] text-neutral-900 mb-6">
        Progress Pelaporan
      </h2>

      {/* List Timeline sesuai screenshot "Progress List" */}
      <div className="flex flex-col w-full">
        <ProgressStep
          tahap="1"
          judul="Disembelih"
          deskripsi="Hewan qurban telah disembelih sesuai syariat Islam."
          tanggal="27 Mei 2026 08:30 WIB"
          status="success"
        />

        <ProgressStep
          tahap="2"
          judul="Distribusi"
          deskripsi="Daging qurban sedang didistribusikan kepada penerima manfaat."
          tanggal="27 Mei 2026 14:30 WIB"
          status="success"
        />

        <ProgressStep
          tahap="3"
          judul="Selesai"
          deskripsi="Proses qurban telah selesai! Terimakasih telah mempercayai Qurban Story."
          status="success"
          isLast={true}
        />
      </div>
    </div>
  );
}
