"use client";

import ProgressPelaporan from "@/components/ui/ProgressPelaporan";
import TransactionDetailCard from "@/components/ui/TransactionDetailCard";
import DocumentationCard from "@/components/ui/DocumentationCard";
import DistributionReportCard from "@/components/ui/DistributionReportCard";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TransactionDocumentation = {
  photoUrls: string[];
  videoUrl: string | null;
};

type DetailResponse = {
  data: {
    id: string;
    invoice: string;
    customer: string;
    produk: string;
    tanggal: string;
    nominal: string;
    paymentMethod: string | null;
    pembayaran: string;
    pelaporan: string;
    documentation: TransactionDocumentation;
  };
};

function formatRupiah(value: string | number) {
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

function formatPaymentMethod(type: string | null) {
  if (!type) return "-";
  const methods: Record<string, string> = {
    gopay: "GoPay",
    qris: "QRIS",
    shopeepay: "ShopeePay",
    bank_transfer: "Virtual Account",
    echannel: "Mandiri Bill",
    cstore: "Minimarket",
    credit_card: "Kartu Kredit",
  };
  return methods[type] || type.replace(/_/g, " ").toUpperCase();
}

export default function DetailTransaksiPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [detail, setDetail] = useState<DetailResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;

    let active = true;

    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/transactions/${id}`);
        if (!response.ok) return;

        const payload = (await response.json()) as DetailResponse;
        if (!active) return;

        setDetail(payload.data);
      } catch {
        console.error("Gagal load detail transaksi");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadDetail();

    return () => {
      active = false;
    };
  }, [params?.id]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] py-20 text-center text-neutral-500">
        Memuat detail transaksi...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-[calc(100vh-80px)] py-20 text-center text-neutral-500">
        Transaksi tidak ditemukan.
      </div>
    );
  }

  const isKambing = detail.produk.toLowerCase().includes("kambing");
  const isSapi = detail.produk.toLowerCase().includes("sapi");
  const kodeHewan = isKambing ? "KMB-001" : isSapi ? "SPI-001" : "PRD-001";

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-white flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-[792px] flex flex-col gap-6">
        {/* Tombol Kembali */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 w-max px-0 pt-6 pb-2 text-[#033C46] font-bold text-[16px] leading-[24px] hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none outline-none"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0"
          >
            <mask
              id="mask0_back"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="24"
              height="24"
            >
              <rect width="24" height="24" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_back)">
              <path
                d="M10 18L4 12L10 6L11.4 7.45L7.85 11H20V13H7.85L11.4 16.55L10 18Z"
                fill="#033C46"
              />
            </g>
          </svg>
          <span>Kembali</span>
        </button>

        <TransactionDetailCard
          id={detail.id}
          invoice={detail.invoice}
          tanggal={`${detail.tanggal}`}
          pequrban={detail.customer}
          kodeHewan={kodeHewan}
          metodePembayaran={formatPaymentMethod(detail.paymentMethod)}
          namaBerqurban={detail.customer}
          produk={detail.produk}
          harga={`${formatRupiah(detail.nominal)}`}
        />

        {detail.pembayaran === "BERHASIL" ? (
          <>
            <ProgressPelaporan />
            <DocumentationCard
              photoUrls={detail.documentation.photoUrls || []}
              videoUrl={detail.documentation.videoUrl || null}
            />
            <DistributionReportCard />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3 w-full p-6 rounded-xl border border-neutral-200 bg-white shadow-sm">
              <h2 className="text-[20px] font-bold text-neutral-900">
                Progress Pelaporan
              </h2>
              <div className="flex w-full px-4 py-3 rounded-lg bg-[#FEF1DA] border border-[#FEF1DA]">
                <p className="text-[16px] italic leading-[24px] text-neutral-900">
                  {detail.pembayaran === "KADALUARSA"
                    ? "Fitur ini tidak tersedia karena transaksi kadaluarsa. Silakan buat transaksi baru."
                    : detail.pembayaran === "GAGAL"
                      ? "Fitur ini tidak tersedia karena pembayaran gagal. Silakan coba bayar kembali untuk melanjutkan transaksi."
                      : "Fitur ini tidak tersedia karena pembayaran tertunda. Silakan bayar untuk melanjutkan transaksi."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full p-6 rounded-xl border border-neutral-200 bg-white shadow-sm">
              <h2 className="text-[20px] font-bold text-neutral-900">
                Dokumentasi
              </h2>
              <div className="flex w-full px-4 py-3 rounded-lg bg-[#FEF1DA] border border-[#FEF1DA]">
                <p className="text-[16px] italic leading-[24px] text-neutral-900">
                  {detail.pembayaran === "KADALUARSA"
                    ? "Fitur ini tidak tersedia karena transaksi kadaluarsa. Silakan buat transaksi baru."
                    : detail.pembayaran === "GAGAL"
                      ? "Fitur ini tidak tersedia karena pembayaran gagal. Silakan coba bayar kembali untuk melanjutkan transaksi."
                      : "Fitur ini tidak tersedia karena pembayaran tertunda. Silakan bayar untuk melanjutkan transaksi."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full p-6 rounded-xl border border-neutral-200 bg-white shadow-sm">
              <h2 className="text-[20px] font-bold text-neutral-900">
                Laporan Distribusi
              </h2>
              <div className="flex w-full px-4 py-3 rounded-lg bg-[#FEF1DA] border border-[#FEF1DA]">
                <p className="text-[16px] italic leading-[24px] text-neutral-900">
                  {detail.pembayaran === "KADALUARSA"
                    ? "Fitur ini tidak tersedia karena transaksi kadaluarsa. Silakan buat transaksi baru."
                    : detail.pembayaran === "GAGAL"
                      ? "Fitur ini tidak tersedia karena pembayaran gagal. Silakan coba bayar kembali untuk melanjutkan transaksi."
                      : "Fitur ini tidak tersedia karena pembayaran tertunda. Silakan bayar untuk melanjutkan transaksi."}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
