import { NextResponse } from "next/server";
import {
    bulkUpdateReportingStatus,
    distributeDocumentations,
    getDocumentationDistributionYearDetail,
    getDashboardTransactionMetrics,
    getTransactionById,
    listDocumentationDistributionYears,
    listTransactions,
    updateTransactionDocumentations,
    uploadSlaughterDocumentationByFolders,
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

export async function handleGetTransactionById(id: string) {
    try {
        const data = await getTransactionById(id);

        if (!data) {
            return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal mengambil detail transaksi.";
        return NextResponse.json({ message }, { status: 500 });
    }
}

export async function handleUpdateTransactionDocumentations(id: string, request: Request) {
    try {
        const body = (await request.json()) as {
            photoItems?: Array<{
                dataUrl: string;
                fileName?: string;
            }>;
            videoItem?: {
                dataUrl: string;
                fileName?: string;
            } | null;
        };

        const result = await updateTransactionDocumentations({
            orderId: id,
            photoItems: body.photoItems ?? [],
            videoItem: body.videoItem ?? null,
        });

        return NextResponse.json({ data: result }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal memperbarui dokumentasi transaksi.";

        if (message.includes("tidak ditemukan")) {
            return NextResponse.json({ message }, { status: 404 });
        }

        return NextResponse.json({ message }, { status: 500 });
    }
}

export async function handleBulkUpdateReportingStatus(request: Request) {
    try {
        const body = (await request.json()) as {
            orderIds?: string[];
            applyToFiltered?: boolean;
            filters?: {
                search?: string;
                paymentStatus?: "BERHASIL" | "GAGAL" | "KADALUARSA" | "TERTUNDA" | "Semua Pembayaran";
                reportingStatus?: "Tahap 1/3" | "Tahap 2/3" | "Selesai" | "Belum Dimulai" | "Semua Pelaporan";
            };
            tahap2Date?: string;
            tahap3Date?: string;
        };

        if (!body.applyToFiltered && (!Array.isArray(body.orderIds) || body.orderIds.length === 0)) {
            return NextResponse.json({ message: "Pilih minimal 1 transaksi." }, { status: 400 });
        }

        const result = await bulkUpdateReportingStatus({
            orderIds: body.orderIds,
            applyToFiltered: body.applyToFiltered,
            filters: {
                search: body.filters?.search,
                paymentStatus: body.filters?.paymentStatus,
                reportingStatus: body.filters?.reportingStatus,
            },
            tahap2Date: body.tahap2Date,
            tahap3Date: body.tahap3Date,
        });

        return NextResponse.json({ data: result }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal memperbarui status pelaporan.";
        if (message.includes("tidak ditemukan")) {
            return NextResponse.json({ message }, { status: 404 });
        }

        if (message.includes("Pilih minimal")) {
            return NextResponse.json({ message }, { status: 400 });
        }

        return NextResponse.json({ message }, { status: 500 });
    }
}

export async function handleDistributeDocumentations(request: Request) {
    try {
        const body = (await request.json()) as {
            distributionYear?: number;
            removeVideo?: boolean;
            photoDonorFilter?: string;
            photoItems?: Array<{
                fileName: string;
                dataUrl: string;
            }>;
            videoItem?: {
                fileName: string;
                dataUrl: string;
            };
        };

        const result = await distributeDocumentations({
            distributionYear: body.distributionYear,
            removeVideo: body.removeVideo,
            photoDonorFilter: body.photoDonorFilter,
            photoItems: body.photoItems,
            videoItem: body.videoItem,
        });

        return NextResponse.json({ data: result }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal mendistribusikan dokumentasi.";

        if (message.includes("wajib") || message.includes("harus diisi")) {
            return NextResponse.json({ message }, { status: 400 });
        }

        if (message.includes("Tidak ada") || message.includes("Belum ada")) {
            return NextResponse.json({ message }, { status: 404 });
        }

        return NextResponse.json({ message }, { status: 500 });
    }
}

export async function handleUploadSlaughterDocumentations(request: Request) {
    try {
        const body = (await request.json()) as {
            photoItems?: Array<{
                folderName: string;
                fileName: string;
                dataUrl: string;
            }>;
        };

        const result = await uploadSlaughterDocumentationByFolders({
            photoItems: body.photoItems ?? [],
        });

        return NextResponse.json({ data: result }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal mengunggah dokumentasi penyembelihan.";

        if (
            message.includes("tidak valid") ||
            message.includes("tidak ditemukan") ||
            message.includes("ambigu") ||
            message.includes("ORD")
        ) {
            return NextResponse.json({ message }, { status: 400 });
        }

        if (message.includes("Tidak ada folder")) {
            return NextResponse.json({ message }, { status: 404 });
        }

        return NextResponse.json({ message }, { status: 500 });
    }
}

export async function handleListDocumentationDistributionYears(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const result = await listDocumentationDistributionYears({
            search: searchParams.get("search") ?? undefined,
            page: parsePositiveInt(searchParams.get("page"), 1),
            pageSize: parsePositiveInt(searchParams.get("pageSize"), 10),
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal mengambil daftar dokumentasi distribusi.";
        return NextResponse.json({ message }, { status: 500 });
    }
}

export async function handleGetDocumentationDistributionYearDetail(yearParam: string) {
    const year = Number.parseInt(yearParam, 10);

    if (Number.isNaN(year)) {
        return NextResponse.json({ message: "Tahun tidak valid." }, { status: 400 });
    }

    try {
        const data = await getDocumentationDistributionYearDetail(year);
        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal mengambil detail dokumentasi distribusi.";
        return NextResponse.json({ message }, { status: 500 });
    }
}
