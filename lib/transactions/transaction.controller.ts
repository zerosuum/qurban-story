import { NextResponse } from "next/server";
import {
    getDashboardTransactionMetrics,
    listTransactions,
} from "@/lib/transactions/transaction.service";

function parsePositiveInt(value: string | null, defaultValue: number) {
    if (!value) return defaultValue;

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) return defaultValue;

    return parsed;
}

export async function handleListTransactions(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const result = await listTransactions({
            search: searchParams.get("search") ?? undefined,
            paymentStatus: (searchParams.get("payment") as
                | "BERHASIL"
                | "GAGAL"
                | "KADALUARSA"
                | "TERTUNDA"
                | "Semua Pembayaran"
                | null) ?? undefined,
            reportingStatus: (searchParams.get("report") as
                | "Tahap 1/3"
                | "Tahap 2/3"
                | "Selesai"
                | "Belum Dimulai"
                | "Semua Pelaporan"
                | null) ?? undefined,
            page: parsePositiveInt(searchParams.get("page"), 1),
            pageSize: parsePositiveInt(searchParams.get("pageSize"), 10),
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal mengambil data transaksi.";
        return NextResponse.json({ message }, { status: 500 });
    }
}

export async function handleGetDashboardTransactionMetrics() {
    try {
        const data = await getDashboardTransactionMetrics();
        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal mengambil ringkasan dashboard.";
        return NextResponse.json({ message }, { status: 500 });
    }
}
