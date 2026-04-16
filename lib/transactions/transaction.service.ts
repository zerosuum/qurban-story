import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PaymentStatusUi = "BERHASIL" | "GAGAL" | "KADALUARSA" | "TERTUNDA";
export type ReportingStatusUi =
  | "Tahap 1/3"
  | "Tahap 2/3"
  | "Selesai"
  | "Belum Dimulai";

type TransactionItem = {
  id: string;
  invoice: string;
  customer: string;
  produk: string;
  tanggal: string;
  nominal: string;
  pembayaran: PaymentStatusUi;
  pelaporan: ReportingStatusUi;
};

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

export type TransactionDetail = {
  id: string;
  invoice: string;
  customer: string;
  produk: string;
  tanggal: string;
  createdAt: string;
  snapToken: string | null;
  paymentMethod: string | null;
  nominal: string;
  pembayaran: PaymentStatusUi;
  pelaporan: ReportingStatusUi;
  documentation: {
    photoUrls: string[];
    videoUrl: string | null;
  };
};

const DUMP_TRANSACTIONS: TransactionItem[] = [
  {
    id: "dump-001",
    invoice: "INV-2026-001",
    customer: "Siti Aisyah",
    produk: "Kambing Premium",
    tanggal: "15-03-2026",
    nominal: "3200000",
    pembayaran: "BERHASIL",
    pelaporan: "Tahap 1/3",
  },
  {
    id: "dump-002",
    invoice: "INV-2026-002",
    customer: "Ahmad Fauzan",
    produk: "Sapi Limosin (Patungan)",
    tanggal: "16-03-2026",
    nominal: "4000000",
    pembayaran: "TERTUNDA",
    pelaporan: "Belum Dimulai",
  },
  {
    id: "dump-003",
    invoice: "INV-2026-003",
    customer: "Nisa Rahma",
    produk: "Domba Pilihan",
    tanggal: "17-03-2026",
    nominal: "2800000",
    pembayaran: "GAGAL",
    pelaporan: "Belum Dimulai",
  },
  {
    id: "dump-004",
    invoice: "INV-2026-004",
    customer: "Budi Santoso",
    produk: "Kambing Premium",
    tanggal: "18-03-2026",
    nominal: "3200000",
    pembayaran: "KADALUARSA",
    pelaporan: "Belum Dimulai",
  },
  {
    id: "dump-005",
    invoice: "INV-2026-005",
    customer: "Dewi Lestari",
    produk: "Sapi Brahmana",
    tanggal: "19-03-2026",
    nominal: "25000000",
    pembayaran: "BERHASIL",
    pelaporan: "Tahap 2/3",
  },
  {
    id: "dump-006",
    invoice: "INV-2026-006",
    customer: "Fajar Setiawan",
    produk: "Sapi Limosin (Patungan)",
    tanggal: "20-03-2026",
    nominal: "4000000",
    pembayaran: "BERHASIL",
    pelaporan: "Selesai",
  },
];

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

function mapReportsToUiStatus(
  reports: Array<{ stage: string }>,
): ReportingStatusUi {
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

function applyFilters(items: TransactionItem[], query: TransactionQuery) {
  const keyword = query.search?.trim().toLowerCase();

  return items.filter((item) => {
    const matchesSearch =
      !keyword ||
      item.invoice.toLowerCase().includes(keyword) ||
      item.customer.toLowerCase().includes(keyword) ||
      item.produk.toLowerCase().includes(keyword);

    const matchesPayment =
      !query.paymentStatus ||
      query.paymentStatus === "Semua Pembayaran" ||
      item.pembayaran === query.paymentStatus;

    const matchesReport =
      !query.reportingStatus ||
      query.reportingStatus === "Semua Pelaporan" ||
      item.pelaporan === query.reportingStatus;

    return matchesSearch && matchesPayment && matchesReport;
  });
}

function toListResponse(
  items: TransactionItem[],
  page: number,
  pageSize: number,
  isFallbackData = false,
) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const paginated = items.slice(start, start + pageSize);

  const summary = {
    total,
    berhasil: items.filter((item) => item.pembayaran === "BERHASIL").length,
    tertunda: items.filter((item) => item.pembayaran === "TERTUNDA").length,
    gagal: items.filter((item) => item.pembayaran === "GAGAL").length,
  };

  return {
    data: paginated,
    summary,
    isFallbackData,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
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
            {
              invoice: {
                invoiceNumber: { contains: keyword, mode: "insensitive" },
              },
            },
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

  if (orders.length === 0) {
    const fallbackData = applyFilters(DUMP_TRANSACTIONS, query);
    return toListResponse(fallbackData, page, pageSize, true);
  }

  const mapped: TransactionItem[] = orders.map((order) => {
    const pembayaran = mapOrderStatusToUi(order.status);
    const pelaporan = mapReportsToUiStatus(order.reports);

    return {
      id: order.id,
      invoice:
        order.invoice?.invoiceNumber ??
        `ORD-${order.id.slice(0, 8).toUpperCase()}`,
      customer: order.donorName,
      produk: order.product.name,
      tanggal: formatDate(order.createdAt),
      nominal: order.totalPrice.toString(),
      pembayaran,
      pelaporan,
    };
  });

  const filtered = applyFilters(mapped, query);
  return toListResponse(filtered, page, pageSize, false);
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

  if (totalTransaksi === 0) {
    const fallbackTotal = DUMP_TRANSACTIONS.length;
    return {
      totalTransaksi: fallbackTotal,
      pembayaranBerhasil: DUMP_TRANSACTIONS.filter(
        (item) => item.pembayaran === "BERHASIL",
      ).length,
      menungguPembayaran: DUMP_TRANSACTIONS.filter(
        (item) => item.pembayaran === "TERTUNDA",
      ).length,
      tanpaDokumentasi: DUMP_TRANSACTIONS.filter(
        (item) => item.pelaporan === "Belum Dimulai",
      ).length,
      progress: {
        tahap1: DUMP_TRANSACTIONS.filter(
          (item) => item.pelaporan === "Tahap 1/3",
        ).length,
        tahap2: DUMP_TRANSACTIONS.filter(
          (item) => item.pelaporan === "Tahap 2/3",
        ).length,
        tahap3: DUMP_TRANSACTIONS.filter((item) => item.pelaporan === "Selesai")
          .length,
        total: fallbackTotal,
      },
    };
  }

  const pembayaranBerhasil = orders.filter(
    (order) => order.status === "PAID",
  ).length;
  const menungguPembayaran = orders.filter(
    (order) => order.status === "PAYMENT_PENDING",
  ).length;
  const tanpaDokumentasi = orders.filter(
    (order) => order.reports.length === 0,
  ).length;

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

export async function getTransactionById(
  id: string,
): Promise<TransactionDetail | null> {
  const fallback = DUMP_TRANSACTIONS.find((item) => item.id === id);

  if (fallback) {
    return {
      ...fallback,
      createdAt: new Date().toISOString(),
      snapToken: null,
      paymentMethod: "qris",
      documentation: {
        photoUrls: [],
        videoUrl: null,
      },
    };
  }

  const order = await prisma.order.findUnique({
    where: { id },
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
      payment: {
        select: {
          paymentType: true,
        },
      },
      docs: {
        select: {
          mediaType: true,
          mediaUrl: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  const photoUrls = order.docs
    .filter((doc) => doc.mediaType === "IMAGE")
    .map((doc) => doc.mediaUrl);

  const videoUrl =
    order.docs.find((doc) => doc.mediaType === "VIDEO")?.mediaUrl ?? null;

  return {
    id: order.id,
    invoice:
      order.invoice?.invoiceNumber ??
      `ORD-${order.id.slice(0, 8).toUpperCase()}`,
    customer: order.donorName,
    produk: order.product.name,
    tanggal: formatDate(order.createdAt),
    createdAt: order.createdAt.toISOString(),
    snapToken: order.snapToken,
    paymentMethod: order.payment?.paymentType ?? null,
    nominal: order.totalPrice.toString(),
    pembayaran: mapOrderStatusToUi(order.status),
    pelaporan: mapReportsToUiStatus(order.reports),
    documentation: {
      photoUrls,
      videoUrl,
    },
  };
}