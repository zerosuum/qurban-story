"use client";

import TransactionTable from "@/components/ui/TransactionTable";

export default function TransaksiPage() {
    return (
        <main>
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col">
                    <p className="text-xl font-bold">Manajemen Transaksi</p>
                    <p className="text-lg font-medium">Kelola semua transaksi qurban.</p>
                </div>

                <TransactionTable mode="transaksi" />
            </div>
        </main>
    );
}
