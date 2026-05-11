import { NextResponse } from "next/server";
import { getCustomerById, listCustomers } from "@/lib/customers/customer.service";

function parsePositiveInt(value: string | null, defaultValue: number) {
    if (!value) return defaultValue;

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) return defaultValue;

    return parsed;
}

export async function handleListCustomers(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const result = await listCustomers({
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
            pageSize: parsePositiveInt(searchParams.get("pageSize"), 25),
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal mengambil data customer.";
        return NextResponse.json({ message }, { status: 500 });
    }
}

export async function handleGetCustomerById(id: string) {
    try {
        const data = await getCustomerById(id);

        if (!data) {
            return NextResponse.json({ message: "Customer tidak ditemukan." }, { status: 404 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal mengambil detail customer.";
        return NextResponse.json({ message }, { status: 500 });
    }
}