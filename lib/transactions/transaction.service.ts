import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PaymentStatusUi = "BERHASIL" | "GAGAL" | "KADALUARSA" | "TERTUNDA";
export type ReportingStatusUi = "Tahap 1/3" | "Tahap 2/3" | "Selesai" | "Belum Dimulai";

type TransactionQuery = {
    search?: string;
    paymentStatus?: PaymentStatusUi | "Semua Pembayaran";
    reportingStatus?: ReportingStatusUi | "Semua Pelaporan";
    page?: number;
    pageSize?: number;
};

export type DashboardTransactionMetrics = {
    totalTransaksi: number;
    pembayaranBerhasil: number;
    menungguPembayaran: number;
    tanpaDokumentasi: number;
    progress: {
        tahap1: number;
        tahap2: number;
        tahap3: number;
        total: number;
    };
};

function mapOrderStatusToUi(status: OrderStatus): PaymentStatusUi {
    if (status === "PAID") return "BERHASIL";
    if (status === "FAILED") return "GAGAL";
    if (status === "EXPIRED") return "KADALUARSA";
    return "TERTUNDA";
}

function mapUiToOrderStatus(status?: string): OrderStatus | null {
    if (!status || status === "Semua Pembayaran") return null;
    if (status === "BERHASIL") return "PAID";
    if (status === "GAGAL") return "FAILED";
    if (status === "KADALUARSA") return "EXPIRED";
    if (status === "TERTUNDA") return "PAYMENT_PENDING";
    return null;
}

function mapReportsToUiStatus(reports: Array<{ stage: string }>): ReportingStatusUi {
    const stages = new Set(reports.map((item) => item.stage));

    if (stages.has("STAGE_3")) return "Selesai";
    if (stages.has("STAGE_2")) return "Tahap 2/3";
    if (stages.has("STAGE_1")) return "Tahap 1/3";
    return "Belum Dimulai";
}

function formatDate(date: Date) {
    const day = `${date.getDate()}`.padStart(2, "0");
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

export async function listTransactions(query: TransactionQuery) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 10));
    const keyword = query.search?.trim();
    const paymentStatusFilter = mapUiToOrderStatus(query.paymentStatus);

    const where: Prisma.OrderWhereInput = {
        ...(paymentStatusFilter ? { status: paymentStatusFilter } : {}),
        ...(keyword
            ? {
                OR: [
                    { donorName: { contains: keyword, mode: "insensitive" } },
                    { product: { name: { contains: keyword, mode: "insensitive" } } },
                    { invoice: { invoiceNumber: { contains: keyword, mode: "insensitive" } } },
                ],
            }
            : {}),
    };

    const orders = await prisma.order.findMany({
        where,
        include: {
            product: {
                select: {
                    name: true,
                },
            },
            invoice: {
                select: {
                    invoiceNumber: true,
                },
            },
            reports: {
                select: {
                    stage: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const mapped = orders.map((order) => {
        const pembayaran = mapOrderStatusToUi(order.status);
        const pelaporan = mapReportsToUiStatus(order.reports);

        return {
            id: order.id,
            invoice: order.invoice?.invoiceNumber ?? `ORD-${order.id.slice(0, 8).toUpperCase()}`,
            customer: order.donorName,
            produk: order.product.name,
            tanggal: formatDate(order.createdAt),
            nominal: order.totalPrice.toString(),
            pembayaran,
            pelaporan,
        };
    });

    const reportFilter = query.reportingStatus;
    const filteredByReport =
        !reportFilter || reportFilter === "Semua Pelaporan"
            ? mapped
            : mapped.filter((item) => item.pelaporan === reportFilter);

    const total = filteredByReport.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const paginated = filteredByReport.slice(start, start + pageSize);

    const summary = {
        total,
        berhasil: filteredByReport.filter((item) => item.pembayaran === "BERHASIL").length,
        tertunda: filteredByReport.filter((item) => item.pembayaran === "TERTUNDA").length,
        gagal: filteredByReport.filter((item) => item.pembayaran === "GAGAL").length,
    };

    return {
        data: paginated,
        summary,
        pagination: {
            page,
            pageSize,
            total,
            totalPages,
        },
    };
}

export async function getDashboardTransactionMetrics(): Promise<DashboardTransactionMetrics> {
    const orders = await prisma.order.findMany({
        select: {
            status: true,
            reports: {
                select: {
                    stage: true,
                },
            },
        },
    });

    const totalTransaksi = orders.length;
    const pembayaranBerhasil = orders.filter((order) => order.status === "PAID").length;
    const menungguPembayaran = orders.filter((order) => order.status === "PAYMENT_PENDING").length;
    const tanpaDokumentasi = orders.filter((order) => order.reports.length === 0).length;

    const progress = {
        tahap1: 0,
        tahap2: 0,
        tahap3: 0,
    };

    for (const order of orders) {
        const currentStatus = mapReportsToUiStatus(order.reports);

        if (currentStatus === "Tahap 1/3") {
            progress.tahap1 += 1;
            continue;
        }

        if (currentStatus === "Tahap 2/3") {
            progress.tahap2 += 1;
            continue;
        }

        if (currentStatus === "Selesai") {
            progress.tahap3 += 1;
        }
    }

    return {
        totalTransaksi,
        pembayaranBerhasil,
        menungguPembayaran,
        tanpaDokumentasi,
        progress: {
            ...progress,
            total: totalTransaksi,
        },
    };
}
