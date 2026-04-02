"use client";

import { useCallback, useState } from "react";
import DashboardCard from "@/components/ui/DashboardCard";
import TransactionTable from "@/components/ui/TransactionTable";

type TransactionSummary = {
    total: number;
    berhasil: number;
    tertunda: number;
    gagal: number;
};

function formatNumber(value: number) {
    return new Intl.NumberFormat("id-ID").format(value);
}

export default function TransaksiPage() {
    const [summary, setSummary] = useState<TransactionSummary>({
        total: 0,
        berhasil: 0,
        tertunda: 0,
        gagal: 0,
    });

    const handleSummaryChange = useCallback((nextSummary: TransactionSummary) => {
        setSummary(nextSummary);
    }, []);

    return (
        <main>
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col">
                    <p className="text-xl font-bold">Manajemen Transaksi</p>
                    <p className="text-lg font-medium">Kelola transaksi qurban dan status pembayarannya.</p>
                </div>

                <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <DashboardCard title="Total Transaksi" value={formatNumber(summary.total)} variant="blue" />
                    <DashboardCard title="Pembayaran Berhasil" value={formatNumber(summary.berhasil)} variant="green" />
                    <DashboardCard title="Menunggu Pembayaran" value={formatNumber(summary.tertunda)} variant="yellow" />
                    <DashboardCard title="Pembayaran Gagal" value={formatNumber(summary.gagal)} variant="red" />
                </div>

                <TransactionTable onSummaryChange={handleSummaryChange} />
            </div>
        </main>
    );
}
