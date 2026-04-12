"use client";

import { useEffect, useState } from "react";
import CtaBanner from "@/components/ui/CtaBanner";
import StatusPelaporanBadge, {
  PelaporanStatus,
} from "@/components/ui/StatusPelaporanBadge";
import StatusPembayaranBadge, {
  PembayaranStatus,
} from "@/components/ui/StatusPembayaranBadge";
import TransactionCard from "@/components/ui/TransactionCard";
import Link from "next/link";

type TransactionRow = {
  id: string;
  invoice: string;
  produk: string;
  tanggal: string;
  pembayaran: string;
  pelaporan: string;
};

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    lastPayment: "Belum Dimulai" as PembayaranStatus | string,
    lastReport: "Belum Dimulai" as PelaporanStatus | string,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardTrx = async () => {
      try {
        const res = await fetch("/api/transactions?pageSize=3");
        if (!res.ok) return;
        const json = await res.json();

        const trxs = json.data || [];
        setTransactions(trxs);

        if (trxs.length > 0) {
          setStats({
            total: json.summary?.total || trxs.length,
            lastPayment: trxs[0].pembayaran,
            lastReport: trxs[0].pelaporan,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDashboardTrx();
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-white flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-249 flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6 w-full">
          <h1 className="font-sans text-[36px] font-semibold leading-11.5 text-primary-700">
            Dashboard
          </h1>
          <p className="font-sans text-[20px] font-medium leading-6.5 text-primary-700">
            Selamat datang kembali! Pantau transaksi qurban Anda.
          </p>
        </div>

        {/* KPI Cards*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Card 1: Total Transaksi */}
          <div className="flex flex-col justify-between items-start w-full h-30 p-6 bg-white border border-neutral-100 rounded-xl shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)] shrink-0">
            <span className="w-full font-sans text-[18px] font-normal leading-6.75 text-neutral-900">
              Total Transaksi
            </span>
            <span className="font-sans text-[18px] font-bold leading-6.75 text-neutral-900">
              {isLoading ? "..." : stats.total}
            </span>
          </div>

          {/* Card 2: Pembayaran Terakhir */}
          <div className="flex flex-col justify-between items-start w-full h-30 p-6 bg-white border border-neutral-100 rounded-xl shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)] shrink-0">
            <span className="w-full font-sans text-[18px] font-normal leading-6.75 text-neutral-900 line-clamp-2">
              Pembayaran Transaksi Terakhir
            </span>
            {isLoading ? (
              <span className="text-sm text-neutral-400 font-semibold">
                ...
              </span>
            ) : stats.lastPayment !== "Belum Dimulai" ? (
              <StatusPembayaranBadge status={stats.lastPayment} size="sm" />
            ) : (
              <span className="text-sm text-neutral-400 font-semibold">-</span>
            )}
          </div>

          {/* Card 3: Pelaporan Terakhir */}
          <div className="flex flex-col justify-between items-start w-full h-30 p-6 bg-white border border-neutral-100 rounded-xl shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)] shrink-0">
            <span className="w-full font-sans text-[18px] font-normal leading-6.75 text-neutral-900 line-clamp-2">
              Pelaporan Transaksi Terakhir
            </span>
            {isLoading ? (
              <span className="text-sm text-neutral-400 font-semibold">
                ...
              </span>
            ) : stats.lastReport !== "Belum Dimulai" ? (
              <StatusPelaporanBadge
                status={stats.lastReport as PelaporanStatus}
                size="sm"
              />
            ) : (
              <span className="text-sm text-neutral-400 font-semibold">-</span>
            )}
          </div>
        </div>

        {/* CTA Banner */}
        <CtaBanner />

        {/* SECTION RIWAYAT TRANSAKSI */}
        <div className="flex flex-col gap-8 w-full">
          {/* Header Riwayat Transaksi */}
          <div className="flex justify-between items-center self-stretch w-full">
            <h2 className="font-sans text-[20px] font-medium leading-6.5 text-primary-700">
              Riwayat Transaksi
            </h2>

            <Link
              href="/riwayat-trx"
              className="group flex justify-center items-center h-10 px-4 py-2 gap-2.5 rounded-xl border border-primary-500 text-primary-600 hover:bg-neutral-50 hover:text-primary-600 hover:border-primary-600 active:scale-95 transition-all duration-200"
            >
              <span className="font-sans font-bold text-[16px]">
                Selengkapnya
              </span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              >
                <mask
                  id="mask0_538_10284"
                  style={{ maskType: "alpha" }}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="24"
                  height="24"
                >
                  <rect
                    x="24"
                    y="24"
                    width="24"
                    height="24"
                    transform="rotate(-180 24 24)"
                    fill="#D9D9D9"
                  />
                </mask>
                <g mask="url(#mask0_538_10284)">
                  <path
                    d="M14 6L20 12L14 18L12.6 16.55L16.15 13L4 13V11L16.15 11L12.6 7.45L14 6Z"
                    fill="currentColor"
                  />
                </g>
              </svg>
            </Link>
          </div>

          {/* List Card */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="py-8 text-center text-neutral-500 italic">
                Memuat riwayat transaksi...
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 italic">
                Belum ada transaksi terbaru.
              </div>
            ) : (
              transactions.map((trx) => (
                <TransactionCard
                  key={trx.id}
                  id={trx.id}
                  productName={trx.produk}
                  invoice={trx.invoice}
                  date={trx.tanggal}
                  status={
                    trx.pembayaran === "TERTUNDA" ||
                    trx.pembayaran === "PAYMENT_PENDING"
                      ? "MENUNGGU PEMBAYARAN"
                      : trx.pembayaran
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
