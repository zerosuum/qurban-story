import { OrderStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PaymentStatus = "BERHASIL" | "GAGAL" | "KADALUARSA" | "TERTUNDA";
export type ReportingStatus = "Tahap 1/3" | "Tahap 2/3" | "Selesai" | "Belum Dimulai";

export type CustomerListItem = {
    id: string;
    name: string;
    email: string;
    phone: string;
    lastTransactionDate: string;
    totalTransactions: number;
    paymentStatus: PaymentStatus;
    reportStatus: ReportingStatus;
};

export type CustomerDetail = {
    id: string;
    name: string;
    email: string;
    phone: string;
    lastTransactionDate: string;
    totalTransactions: number;
    transactions: Array<{
        id: string;
        invoice: string;
        reportingStatus: ReportingStatus;
    }>;
};

type CustomerQuery = {
    search?: string;
    paymentStatus?: PaymentStatus | "Semua Pembayaran";
    reportingStatus?: ReportingStatus | "Semua Pelaporan";
    page?: number;
    pageSize?: number;
};

function mapOrderStatusToUi(status: OrderStatus): PaymentStatus {
    if (status === "PAID") return "BERHASIL";
    if (status === "FAILED") return "GAGAL";
    if (status === "EXPIRED") return "KADALUARSA";
    return "TERTUNDA";
}

function mapReportsToUiStatus(reports: Array<{ stage: string }>): ReportingStatus {
    const stages = new Set(reports.map((item) => item.stage));

    if (stages.has("STAGE_3")) return "Selesai";
    if (stages.has("STAGE_2")) return "Tahap 2/3";
    if (stages.has("STAGE_1")) return "Tahap 1/3";
    return "Belum Dimulai";
}

function formatDate(date: Date) {
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export async function listCustomers(query: CustomerQuery) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 25));
    const keyword = query.search?.trim();

    const users = await prisma.user.findMany({
        where: {
            role: UserRole.CUSTOMER,
            ...(keyword
                ? {
                    OR: [
                        { name: { contains: keyword, mode: "insensitive" } },
                        { email: { contains: keyword, mode: "insensitive" } },
                        {
                            orders: {
                                some: {
                                    donorPhone: { contains: keyword, mode: "insensitive" },
                                },
                            },
                        },
                    ],
                }
                : {}),
        },
        include: {
            orders: {
                select: {
                    id: true,
                    donorPhone: true,
                    status: true,
                    createdAt: true,
                    reports: {
                        select: {
                            stage: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const mapped: CustomerListItem[] = users.map((user) => {
        const latestOrder = user.orders[0];
        const paymentStatus = latestOrder ? mapOrderStatusToUi(latestOrder.status) : "TERTUNDA";
        const reportStatus = latestOrder ? mapReportsToUiStatus(latestOrder.reports) : "Belum Dimulai";

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: latestOrder?.donorPhone ?? "-",
            lastTransactionDate: latestOrder ? formatDate(latestOrder.createdAt) : "-",
            totalTransactions: user.orders.length,
            paymentStatus,
            reportStatus,
        };
    });

    const filtered = mapped.filter((customer) => {
        const matchPayment =
            !query.paymentStatus ||
            query.paymentStatus === "Semua Pembayaran" ||
            customer.paymentStatus === query.paymentStatus;

        const matchReport =
            !query.reportingStatus ||
            query.reportingStatus === "Semua Pelaporan" ||
            customer.reportStatus === query.reportingStatus;

        return matchPayment && matchReport;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return {
        data,
        pagination: {
            page,
            pageSize,
            total,
            totalPages,
        },
    };
}

export async function getCustomerById(id: string): Promise<CustomerDetail | null> {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            orders: {
                include: {
                    reports: {
                        select: {
                            stage: true,
                        },
                    },
                    invoice: {
                        select: {
                            invoiceNumber: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    if (!user || user.role !== UserRole.CUSTOMER) {
        return null;
    }

    const latestOrder = user.orders[0];

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: latestOrder?.donorPhone ?? "-",
        lastTransactionDate: latestOrder ? formatDate(latestOrder.createdAt) : "-",
        totalTransactions: user.orders.length,
        transactions: user.orders.map((order) => ({
            id: order.id,
            invoice: order.invoice?.invoiceNumber ?? `ORD-${order.id.slice(0, 8).toUpperCase()}`,
            reportingStatus: mapReportsToUiStatus(order.reports),
        })),
    };
}