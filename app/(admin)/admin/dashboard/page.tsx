"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardCard from "@/components/ui/DashboardCard";
import TransactionTable from "@/components/ui/TransactionTable";

type DashboardMetricsResponse = {
    data: {
        totalTransaksi: number;
        pembayaranBerhasil: number;
        menungguPembayaran: number;
        pembayaranKadaluarsa: number;
        tanpaDokumentasi: number;
        progress: {
            tahap1: number;
            tahap2: number;
            tahap3: number;
            total: number;
        };
    };
};

function formatNumber(value: number) {
    return new Intl.NumberFormat("id-ID").format(value);
}

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<DashboardMetricsResponse["data"]>({
        totalTransaksi: 0,
        pembayaranBerhasil: 0,
        menungguPembayaran: 0,
        pembayaranKadaluarsa: 0,
        tanpaDokumentasi: 0,
        progress: {
            tahap1: 0,
            tahap2: 0,
            tahap3: 0,
            total: 0,
        },
    });

    useEffect(() => {
        const controller = new AbortController();

        const fetchMetrics = async () => {
            try {
                const response = await fetch("/api/transactions/dashboard", {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Gagal mengambil ringkasan dashboard.");
                }

                const result = (await response.json()) as DashboardMetricsResponse;
                setMetrics(result.data);
            } catch (error) {
                if ((error as Error).name === "AbortError") {
                    return;
                }
            }
        };

        fetchMetrics();

        return () => controller.abort();
    }, []);

    const progressPercentages = useMemo(() => {
        if (metrics.progress.total <= 0) {
            return {
                tahap1: 0,
                tahap2: 0,
                tahap3: 0,
            };
        }

        return {
            tahap1: (metrics.progress.tahap1 / metrics.progress.total) * 100,
            tahap2: (metrics.progress.tahap2 / metrics.progress.total) * 100,
            tahap3: (metrics.progress.tahap3 / metrics.progress.total) * 100,
        };
    }, [metrics.progress]);

    return (
        <main>
            <div className="flex flex-col p-6 gap-6">
                <div className="flex flex-col">
                    <p className="text-xl font-bold">Dashboard Admin</p>
                    <p className="text-lg font-medium">Kelola transaksi dan pelaporan qurban.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 w-full">
                    <DashboardCard title="Total Transaksi" value={formatNumber(metrics.totalTransaksi)} variant="blue" />
                    <DashboardCard title="Pembayaran Berhasil" value={formatNumber(metrics.pembayaranBerhasil)} variant="green" />
                    <DashboardCard title="Menunggu Pembayaran" value={formatNumber(metrics.menungguPembayaran)} variant="yellow" />
                    <DashboardCard title="Pembayaran Kadaluarsa" value={formatNumber(metrics.pembayaranKadaluarsa)} variant="gray" />
                    <DashboardCard title="Tanpa Dokumentasi" value={formatNumber(metrics.tanpaDokumentasi)} variant="red" />
                </div>
                <div className="w-full rounded-xl border border-neutral-200 p-6 flex flex-col gap-4 h-fit bg-white">
                    <h5 className="font-bold text-2xl">Progress Pelaporan</h5>
                    <div>
                        <div className="w-full flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between w-full font-semibold text-primary-500">
                                <p>Tahap 1 - Disembelih</p>
                                <p>
                                    {formatNumber(metrics.progress.tahap1)} / {formatNumber(metrics.progress.total)}
                                </p>
                            </div>
                            <div className="w-full bg-neutral-100 rounded-full">
                                <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${progressPercentages.tahap1}%` }}></div>
                            </div>
                            <div className="flex flex-row items-center justify-between w-full font-semibold text-primary-500">
                                <p>Tahap 2 - Distribusi</p>
                                <p>
                                    {formatNumber(metrics.progress.tahap2)} / {formatNumber(metrics.progress.total)}
                                </p>
                            </div>
                            <div className="w-full bg-neutral-100 rounded-full">
                                <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${progressPercentages.tahap2}%` }}></div>
                            </div>
                            <div className="flex flex-row items-center justify-between w-full font-semibold text-primary-500">
                                <p>Tahap 3 - Selesai</p>
                                <p>
                                    {formatNumber(metrics.progress.tahap3)} / {formatNumber(metrics.progress.total)}
                                </p>
                            </div>
                            <div className="w-full bg-neutral-100">
                                <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${progressPercentages.tahap3}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <TransactionTable mode="dashboard" />
            </div>
        </main>
    );
}