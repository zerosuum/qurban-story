import { OrderStatus, Prisma, ReportStage, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { coreApi, snap } from "@/lib/midtrans";

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
  createdAt?: string;
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
  userId?: string;
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
  nominal: string;
  snapToken: string | null;
  paymentMethod: string | null;
  pembayaran: PaymentStatusUi;
  pelaporan: ReportingStatusUi;
  documentation: {
    photoUrls: string[];
    videoUrl: string | null;
  };
};

type BulkUpdateReportingInput = {
  orderIds?: string[];
  applyToFiltered?: boolean;
  filters?: Pick<
    TransactionQuery,
    "search" | "paymentStatus" | "reportingStatus"
  >;
  tahap2Date?: string;
  tahap3Date?: string;
};

type DistributeDocumentationInput = {
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

type SlaughterFolderPhotoInput = {
  folderName: string;
  fileName: string;
  dataUrl: string;
};

type SlaughterFolderUploadInput = {
  photoItems: SlaughterFolderPhotoInput[];
};

type DocumentationYearsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

type UpdateTransactionDocumentationInput = {
  orderId: string;
  photoItems: Array<{
    dataUrl: string;
    fileName?: string;
  }>;
  videoItem?: {
    dataUrl: string;
    fileName?: string;
  } | null;
};

function getReadablePaymentErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const potential = error as { ApiResponse?: { status_message?: string } };
    if (potential.ApiResponse?.status_message) {
      return potential.ApiResponse.status_message;
    }
  }

  return "Terjadi kesalahan saat menyiapkan pembayaran.";
}

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

type MidtransStatusResponse = {
  transaction_status?: string;
  fraud_status?: string;
  transaction_id?: string;
  payment_type?: string;
  gross_amount?: string;
};

function mapMidtransToOrderStatus(
  status?: string,
  fraudStatus?: string,
): OrderStatus {
  if (status === "settlement") return "PAID";
  if (status === "capture") {
    if (fraudStatus === "challenge") return "PAYMENT_PENDING";
    return "PAID";
  }
  if (status === "pending") return "PAYMENT_PENDING";
  if (status === "expire") return "EXPIRED";
  if (status === "deny" || status === "cancel" || status === "failure") {
    return "FAILED";
  }
  return "PAYMENT_PENDING";
}

async function syncPendingOrderFromMidtrans(orderId: string): Promise<boolean> {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      totalPrice: true,
      productId: true,
    },
  });

  if (!existingOrder || existingOrder.status !== "PAYMENT_PENDING") {
    return false;
  }

  let statusResponse: MidtransStatusResponse;

  try {
    statusResponse = (await coreApi.transaction.status(
      orderId,
    )) as MidtransStatusResponse;
  } catch (error) {
    console.error("[MIDTRANS_STATUS_SYNC_ERROR]", { orderId, error });
    return false;
  }

  const nextStatus = mapMidtransToOrderStatus(
    statusResponse.transaction_status,
    statusResponse.fraud_status,
  );

  if (nextStatus === "PAYMENT_PENDING") {
    return false;
  }

  const midtransGrossAmount = statusResponse.gross_amount
    ? Math.round(Number(statusResponse.gross_amount))
    : null;
  const dbGrossAmount = Math.round(Number(existingOrder.totalPrice));

  if (midtransGrossAmount !== null && midtransGrossAmount !== dbGrossAmount) {
    console.error("[MIDTRANS_STATUS_SYNC_AMOUNT_MISMATCH]", {
      orderId,
      dbGrossAmount,
      midtransGrossAmount,
    });
    return false;
  }

  await prisma.$transaction(async (tx) => {
    const latestOrder = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        productId: true,
      },
    });

    if (!latestOrder || latestOrder.status !== "PAYMENT_PENDING") {
      return;
    }

    await tx.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        midtransTransactionId: statusResponse.transaction_id,
        paymentType: statusResponse.payment_type,
        grossAmount: statusResponse.gross_amount
          ? Number(statusResponse.gross_amount)
          : undefined,
        transactionStatus: statusResponse.transaction_status,
        rawResponse: statusResponse as Prisma.InputJsonValue,
      },
      update: {
        midtransTransactionId: statusResponse.transaction_id,
        paymentType: statusResponse.payment_type,
        grossAmount: statusResponse.gross_amount
          ? Number(statusResponse.gross_amount)
          : undefined,
        transactionStatus: statusResponse.transaction_status,
        rawResponse: statusResponse as Prisma.InputJsonValue,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        paidAt: nextStatus === "PAID" ? new Date() : null,
      },
    });

    if (nextStatus === "PAID") {
      await tx.product.update({
        where: { id: latestOrder.productId },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });
    }
  });

  console.log("[MIDTRANS_STATUS_SYNC_SUCCESS]", {
    orderId,
    nextStatus,
    transactionStatus: statusResponse.transaction_status,
  });

  return true;
}

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

function buildOrderWhereInput(
  query: Pick<TransactionQuery, "search" | "paymentStatus" | "userId">,
): Prisma.OrderWhereInput {
  const keyword = query.search?.trim();
  const paymentStatusFilter = mapUiToOrderStatus(query.paymentStatus);

  return {
    ...(query.userId ? { userId: query.userId } : {}),
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

function getEffectiveReports(
  orderReports: Array<{ stage: string }>,
  groupReports?: Array<{ stage: string }>,
) {
  if (groupReports && groupReports.length > 0) {
    return groupReports;
  }

  return orderReports;
}

function formatDate(date: Date) {
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function parseDateInput(value?: string): Date | null {
  if (!value || !value.trim()) {
    return null;
  }

  const normalized = value.trim();
  const ddmmyyyy = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function mapStageToUi(stage: ReportStage): ReportingStatusUi {
  if (stage === "STAGE_3") return "Selesai";
  if (stage === "STAGE_2") return "Tahap 2/3";
  return "Tahap 1/3";
}

function getYearRange(year: number) {
  const startDate = new Date(year, 0, 1, 0, 0, 0, 0);
  const endDate = new Date(year + 1, 0, 1, 0, 0, 0, 0);
  return { startDate, endDate };
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function normalizeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function isNameMatch(folderName: string, candidateName: string) {
  const a = normalizeName(folderName);
  const b = normalizeName(candidateName);

  if (!a || !b) {
    return false;
  }

  return a === b || a.includes(b) || b.includes(a);
}

function extractOrdToken(value: string): string | null {
  const match = value.toUpperCase().match(/ORD[\s\-_]?[A-Z0-9]{4,}/);
  if (!match) {
    return null;
  }

  return match[0].replace(/[^A-Z0-9]/g, "");
}

function normalizeInvoiceToken(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
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
  const where = buildOrderWhereInput({
    search: query.search,
    paymentStatus: query.paymentStatus,
    userId: query.userId,
  });

  let orders = await prisma.order.findMany({
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
      group: {
        select: {
          reports: {
            select: {
              stage: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (orders.length === 0) {
    // const fallbackData = applyFilters(DUMP_TRANSACTIONS, query);
    // return toListResponse(fallbackData, page, pageSize, true);
    return toListResponse([], page, pageSize, false);
  }

  const pendingOrderIds = orders
    .filter((order) => order.status === "PAYMENT_PENDING")
    .slice(0, 10)
    .map((order) => order.id);

  if (pendingOrderIds.length > 0) {
    const syncResults = await Promise.allSettled(
      pendingOrderIds.map((orderId) => syncPendingOrderFromMidtrans(orderId)),
    );

    const hasUpdatedStatus = syncResults.some(
      (result) => result.status === "fulfilled" && result.value,
    );

    if (hasUpdatedStatus) {
      orders = await prisma.order.findMany({
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
          group: {
            select: {
              reports: {
                select: {
                  stage: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }
  }

  const mapped: TransactionItem[] = orders.map((order) => {
    const pembayaran = mapOrderStatusToUi(order.status);
    const pelaporan = mapReportsToUiStatus(
      getEffectiveReports(order.reports, order.group?.reports),
    );

    return {
      id: order.id,
      invoice:
        order.invoice?.invoiceNumber ??
        `ORD-${order.id.slice(0, 8).toUpperCase()}`,
      customer: order.donorName,
      produk: order.product.name,
      tanggal: formatDate(order.createdAt),
      createdAt: order.createdAt.toISOString(),
      nominal: order.totalPrice.toString(),
      pembayaran,
      pelaporan,
    };
  });

  const filtered = applyFilters(mapped, query);
  return toListResponse(filtered, page, pageSize, false);
}

export async function getDashboardTransactionMetrics(
  userId?: string,
): Promise<DashboardTransactionMetrics> {
  const orders = await prisma.order.findMany({
    where: {
      ...(userId ? { userId } : {}),
    },
    select: {
      status: true,
      reports: {
        select: {
          stage: true,
        },
      },
      group: {
        select: {
          reports: {
            select: {
              stage: true,
            },
          },
        },
      },
    },
  });

  const totalTransaksi = orders.length;

  if (totalTransaksi === 0) {
    return {
      totalTransaksi: 0,
      pembayaranBerhasil: 0,
      menungguPembayaran: 0,
      tanpaDokumentasi: 0,
      progress: {
        tahap1: 0,
        tahap2: 0,
        tahap3: 0,
        total: 0,
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
    (order) =>
      getEffectiveReports(order.reports, order.group?.reports).length === 0,
  ).length;

  const progress = {
    tahap1: 0,
    tahap2: 0,
    tahap3: 0,
  };

  for (const order of orders) {
    const currentStatus = mapReportsToUiStatus(
      getEffectiveReports(order.reports, order.group?.reports),
    );

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
      paymentMethod: null,
      documentation: {
        photoUrls: [],
        videoUrl: null,
      },
    };
  }

  await syncPendingOrderFromMidtrans(id);

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      donorName: true,
      totalPrice: true,
      status: true,
      createdAt: true,
      payment: {
        select: {
          paymentType: true,
        },
      },
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
      group: {
        select: {
          reports: {
            select: {
              stage: true,
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
      },
    },
  });

  if (!order) {
    return null;
  }

  const combinedDocs = [...order.docs, ...(order.group?.docs ?? [])].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const photoUrls = Array.from(
    new Set(
      combinedDocs
        .filter((doc) => doc.mediaType === "IMAGE")
        .map((doc) => doc.mediaUrl),
    ),
  );

  const videoUrl =
    combinedDocs.find((doc) => doc.mediaType === "VIDEO")?.mediaUrl ?? null;

  return {
    id: order.id,
    invoice:
      order.invoice?.invoiceNumber ??
      `ORD-${order.id.slice(0, 8).toUpperCase()}`,
    customer: order.donorName,
    produk: order.product.name,
    tanggal: formatDate(order.createdAt),
    createdAt: order.createdAt.toISOString(),
    nominal: order.totalPrice.toString(),
    snapToken: null,
    paymentMethod: order.payment?.paymentType || null,
    pembayaran: mapOrderStatusToUi(order.status),
    pelaporan: mapReportsToUiStatus(
      getEffectiveReports(order.reports, order.group?.reports),
    ),
    documentation: {
      photoUrls,
      videoUrl,
    },
  };
}

export async function regenerateTransactionPaymentToken(
  orderId: string,
  userId?: string,
) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ...(userId ? { userId } : {}),
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Transaksi tidak ditemukan.");
  }

  if (order.status === "PAID") {
    throw new Error("Transaksi sudah lunas dan tidak bisa dibayar ulang.");
  }

  if (!process.env.MIDTRANS_SERVER_KEY || !process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) {
    throw new Error("Konfigurasi Midtrans belum lengkap di server.");
  }

  const grossAmount = Math.max(1, Math.round(Number(order.totalPrice)));
  const retrySuffix = `r${Date.now().toString(36)}`;
  const maxBaseLength = Math.max(1, 50 - retrySuffix.length - 1);
  const midtransOrderId = `${order.id.slice(0, maxBaseLength)}-${retrySuffix}`;

  const parameter = {
    transaction_details: {
      order_id: midtransOrderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: order.donorName,
      email: order.user.email ?? undefined,
      phone: order.donorPhone,
    },
    item_details: [
      {
        id: order.product.id,
        price: grossAmount,
        quantity: 1,
        name: order.product.name.substring(0, 50),
      },
    ],
  };

  try {
    const snapResponse = await snap.createTransaction(parameter);

    try {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAYMENT_PENDING",
          snapToken: snapResponse.token,
        },
      });
    } catch (error) {
      // Fallback for environments where snapToken is unavailable in DB/client.
      const isMissingSnapTokenColumn =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2022";
      const isSnapTokenValidationError =
        error instanceof Prisma.PrismaClientValidationError &&
        error.message.toLowerCase().includes("snaptoken");

      if (
        isMissingSnapTokenColumn ||
        isSnapTokenValidationError
      ) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PAYMENT_PENDING",
          },
        });
      } else {
        throw error;
      }
    }

    return {
      orderId: order.id,
      token: snapResponse.token,
    };
  } catch (error) {
    const message = getReadablePaymentErrorMessage(error);
    throw new Error(message);
  }
}

export async function updateTransactionDocumentations(
  input: UpdateTransactionDocumentationInput,
) {
  const validPhotoItems = input.photoItems.filter(
    (item) => item.dataUrl && item.dataUrl.startsWith("data:image/"),
  );

  const validVideoItem =
    input.videoItem && input.videoItem.dataUrl.startsWith("data:video/")
      ? input.videoItem
      : null;

  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    select: {
      id: true,
      animalGroupId: true,
    },
  });

  if (!order) {
    throw new Error("Transaksi tidak ditemukan.");
  }

  const isGrouped = Boolean(order.animalGroupId);

  await prisma.$transaction(
    async (tx) => {
      const imageWhere = isGrouped
        ? {
          animalGroupId: order.animalGroupId as string,
          stage: "STAGE_1" as ReportStage,
          mediaType: "IMAGE" as const,
        }
        : {
          orderId: order.id,
          stage: "STAGE_1" as ReportStage,
          mediaType: "IMAGE" as const,
        };

      const videoWhere = isGrouped
        ? {
          animalGroupId: order.animalGroupId as string,
          stage: "STAGE_2" as ReportStage,
          mediaType: "VIDEO" as const,
        }
        : {
          orderId: order.id,
          stage: "STAGE_2" as ReportStage,
          mediaType: "VIDEO" as const,
        };

      await tx.documentation.deleteMany({ where: imageWhere });

      if (validPhotoItems.length > 0) {
        await tx.documentation.createMany({
          data: validPhotoItems.map((item) => ({
            ...(isGrouped
              ? { animalGroupId: order.animalGroupId as string }
              : { orderId: order.id }),
            stage: "STAGE_1",
            mediaType: "IMAGE",
            mediaUrl: item.dataUrl,
            description: item.fileName,
          })),
        });
      }

      await tx.documentation.deleteMany({ where: videoWhere });

      if (validVideoItem) {
        await tx.documentation.create({
          data: {
            ...(isGrouped
              ? { animalGroupId: order.animalGroupId as string }
              : { orderId: order.id }),
            stage: "STAGE_2",
            mediaType: "VIDEO",
            mediaUrl: validVideoItem.dataUrl,
            description: validVideoItem.fileName,
          },
        });
      }
    },
    {
      timeout: 30000,
    },
  );

  return {
    updatedPhotoCount: validPhotoItems.length,
    hasVideo: Boolean(validVideoItem),
    scope: isGrouped ? "GROUP" : "ORDER",
  };
}

export async function bulkUpdateReportingStatus(
  input: BulkUpdateReportingInput,
) {
  let uniqueOrderIds: string[] = [];

  if (input.applyToFiltered) {
    const filters = input.filters ?? {};

    const orders = await prisma.order.findMany({
      where: buildOrderWhereInput({
        search: filters.search,
        paymentStatus: filters.paymentStatus,
      }),
      select: {
        id: true,
        animalGroupId: true,
        reports: {
          select: {
            stage: true,
          },
        },
        group: {
          select: {
            reports: {
              select: {
                stage: true,
              },
            },
          },
        },
      },
    });

    uniqueOrderIds = orders
      .filter((order) => {
        if (
          !filters.reportingStatus ||
          filters.reportingStatus === "Semua Pelaporan"
        ) {
          return true;
        }

        return (
          mapReportsToUiStatus(
            getEffectiveReports(order.reports, order.group?.reports),
          ) === filters.reportingStatus
        );
      })
      .map((order) => order.id);
  } else {
    uniqueOrderIds = Array.from(
      new Set((input.orderIds ?? []).filter(Boolean)),
    );
  }

  if (uniqueOrderIds.length === 0) {
    throw new Error("Pilih minimal 1 transaksi.");
  }

  const parsedTahap2Date = parseDateInput(input.tahap2Date);
  const parsedTahap3Date = parseDateInput(input.tahap3Date);

  const targetStage: ReportStage = parsedTahap3Date
    ? "STAGE_3"
    : parsedTahap2Date
      ? "STAGE_2"
      : "STAGE_1";

  const now = new Date();

  const stagesToApply: Array<{ stage: ReportStage; executionDate: Date }> = [
    { stage: "STAGE_1", executionDate: now },
  ];

  if (targetStage === "STAGE_2" || targetStage === "STAGE_3") {
    stagesToApply.push({
      stage: "STAGE_2",
      executionDate: parsedTahap2Date ?? parsedTahap3Date ?? now,
    });
  }

  if (targetStage === "STAGE_3") {
    stagesToApply.push({
      stage: "STAGE_3",
      executionDate: parsedTahap3Date ?? now,
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const existingOrders = await tx.order.findMany({
      where: {
        id: {
          in: uniqueOrderIds,
        },
      },
      select: {
        id: true,
        animalGroupId: true,
      },
    });

    if (existingOrders.length !== uniqueOrderIds.length) {
      throw new Error("Sebagian transaksi tidak ditemukan.");
    }

    const groupIds = Array.from(
      new Set(
        existingOrders.map((order) => order.animalGroupId).filter(Boolean),
      ),
    ) as string[];
    const standaloneOrderIds = existingOrders
      .filter((order) => !order.animalGroupId)
      .map((order) => order.id);

    if (groupIds.length > 0) {
      await tx.reportStageLog.deleteMany({
        where: {
          animalGroupId: {
            in: groupIds,
          },
        },
      });
    }

    if (standaloneOrderIds.length > 0) {
      await tx.reportStageLog.deleteMany({
        where: {
          orderId: {
            in: standaloneOrderIds,
          },
        },
      });
    }

    await tx.reportStageLog.createMany({
      data: [
        ...groupIds.flatMap((groupId) =>
          stagesToApply.map((item) => ({
            animalGroupId: groupId,
            stage: item.stage,
            executionDate: item.executionDate,
          })),
        ),
        ...standaloneOrderIds.flatMap((orderId) =>
          stagesToApply.map((item) => ({
            orderId,
            stage: item.stage,
            executionDate: item.executionDate,
          })),
        ),
      ],
    });

    return {
      updatedOrders: uniqueOrderIds.length,
      targetStage,
    };
  });

  return {
    ...result,
    pelaporan: mapStageToUi(result.targetStage),
  };
}

export async function distributeDocumentations(
  input: DistributeDocumentationInput,
) {
  const photoItems = (input.photoItems ?? []).filter(
    (item) => item.dataUrl && item.dataUrl.startsWith("data:image/"),
  );
  const videoItem =
    input.videoItem && input.videoItem.dataUrl.startsWith("data:video/")
      ? input.videoItem
      : null;

  const shouldRemoveVideo = Boolean(input.removeVideo);

  if (photoItems.length === 0 && !videoItem && !shouldRemoveVideo) {
    throw new Error("Dokumentasi foto atau video harus diisi.");
  }

  if (photoItems.length > 0 && !input.photoDonorFilter?.trim()) {
    throw new Error("Filter nama pequrban wajib diisi untuk distribusi foto.");
  }

  const photoDonorFilter = input.photoDonorFilter?.trim();

  return prisma.$transaction(
    async (tx) => {
      let photoDistributedCount = 0;
      let videoDistributedCount = 0;

      if (photoItems.length > 0 && photoDonorFilter) {
        const photoTargetOrders = await tx.order.findMany({
          where: {
            donorName: {
              contains: photoDonorFilter,
              mode: "insensitive",
            },
            user: {
              role: UserRole.CUSTOMER,
            },
          },
          select: {
            id: true,
            animalGroupId: true,
          },
        });

        if (photoTargetOrders.length === 0) {
          throw new Error(
            "Tidak ada customer yang cocok dengan filter nama pequrban.",
          );
        }

        const groupIds = Array.from(
          new Set(
            photoTargetOrders
              .map((order) => order.animalGroupId)
              .filter(Boolean),
          ),
        ) as string[];
        const standaloneOrderIds = photoTargetOrders
          .filter((order) => !order.animalGroupId)
          .map((order) => order.id);

        if (groupIds.length > 0) {
          await tx.documentation.deleteMany({
            where: {
              animalGroupId: {
                in: groupIds,
              },
              mediaType: "IMAGE",
              stage: "STAGE_1",
            },
          });
        }

        if (standaloneOrderIds.length > 0) {
          await tx.documentation.deleteMany({
            where: {
              orderId: {
                in: standaloneOrderIds,
              },
              mediaType: "IMAGE",
              stage: "STAGE_1",
            },
          });
        }

        await tx.documentation.createMany({
          data: [
            ...groupIds.flatMap((groupId) =>
              photoItems.map((item) => ({
                animalGroupId: groupId,
                stage: "STAGE_1" as ReportStage,
                mediaType: "IMAGE" as const,
                mediaUrl: item.dataUrl,
                description: item.fileName,
              })),
            ),
            ...standaloneOrderIds.flatMap((orderId) =>
              photoItems.map((item) => ({
                orderId,
                stage: "STAGE_1" as ReportStage,
                mediaType: "IMAGE" as const,
                mediaUrl: item.dataUrl,
                description: item.fileName,
              })),
            ),
          ],
        });

        photoDistributedCount = photoTargetOrders.length;
      }

      if (videoItem || shouldRemoveVideo) {
        const yearWhere = input.distributionYear
          ? (() => {
            const { startDate, endDate } = getYearRange(
              input.distributionYear as number,
            );
            return {
              gte: startDate,
              lt: endDate,
            };
          })()
          : undefined;

        const allCustomerOrders = await tx.order.findMany({
          where: {
            user: {
              role: UserRole.CUSTOMER,
            },
            ...(yearWhere
              ? {
                createdAt: yearWhere,
              }
              : {}),
          },
          select: {
            id: true,
            animalGroupId: true,
          },
        });

        if (allCustomerOrders.length === 0) {
          throw new Error(
            "Belum ada transaksi customer untuk distribusi video.",
          );
        }

        const groupIds = Array.from(
          new Set(
            allCustomerOrders
              .map((order) => order.animalGroupId)
              .filter(Boolean),
          ),
        ) as string[];
        const standaloneOrderIds = allCustomerOrders
          .filter((order) => !order.animalGroupId)
          .map((order) => order.id);

        if (groupIds.length > 0) {
          await tx.documentation.deleteMany({
            where: {
              animalGroupId: {
                in: groupIds,
              },
              mediaType: "VIDEO",
              stage: "STAGE_2",
            },
          });
        }

        if (standaloneOrderIds.length > 0) {
          await tx.documentation.deleteMany({
            where: {
              orderId: {
                in: standaloneOrderIds,
              },
              mediaType: "VIDEO",
              stage: "STAGE_2",
            },
          });
        }

        if (videoItem) {
          await tx.documentation.createMany({
            data: [
              ...groupIds.map((groupId) => ({
                animalGroupId: groupId,
                stage: "STAGE_2" as ReportStage,
                mediaType: "VIDEO" as const,
                mediaUrl: videoItem.dataUrl,
                description: videoItem.fileName,
              })),
              ...standaloneOrderIds.map((orderId) => ({
                orderId,
                stage: "STAGE_2" as ReportStage,
                mediaType: "VIDEO" as const,
                mediaUrl: videoItem.dataUrl,
                description: videoItem.fileName,
              })),
            ],
          });
        }

        videoDistributedCount = allCustomerOrders.length;
      }

      return {
        photoDistributedCount,
        videoDistributedCount,
      };
    },
    {
      timeout: 30000,
    },
  );
}

export async function uploadSlaughterDocumentationByFolders(
  input: SlaughterFolderUploadInput,
) {
  const validPhotos = input.photoItems.filter(
    (item) =>
      item.folderName?.trim() &&
      item.fileName?.trim() &&
      item.dataUrl?.startsWith("data:image/"),
  );

  if (validPhotos.length === 0) {
    throw new Error(
      "File foto dalam folder tidak ditemukan atau format tidak valid.",
    );
  }

  const groupedByFolder = new Map<
    string,
    { originalFolderName: string; photos: SlaughterFolderPhotoInput[] }
  >();

  for (const item of validPhotos) {
    const key = normalizeName(item.folderName);
    if (!groupedByFolder.has(key)) {
      groupedByFolder.set(key, {
        originalFolderName: item.folderName,
        photos: [],
      });
    }
    groupedByFolder.get(key)?.photos.push(item);
  }

  return prisma.$transaction(
    async (tx) => {
      let matchedFolderCount = 0;

      const candidateOrders = await tx.order.findMany({
        where: {
          user: {
            role: UserRole.CUSTOMER,
          },
        },
        select: {
          id: true,
          donorName: true,
          animalGroupId: true,
          invoice: {
            select: {
              invoiceNumber: true,
            },
          },
          participants: {
            select: {
              participantName: true,
            },
          },
        },
      });

      const photosByOrderId = new Map<string, SlaughterFolderPhotoInput[]>();
      const photosByGroupId = new Map<string, SlaughterFolderPhotoInput[]>();

      for (const [folderKey, folderGroup] of groupedByFolder.entries()) {
        const { originalFolderName, photos } = folderGroup;

        const matchedByName = candidateOrders.filter((order) => {
          if (isNameMatch(folderKey, order.donorName)) {
            return true;
          }

          return order.participants.some((participant) =>
            isNameMatch(folderKey, participant.participantName),
          );
        });

        if (matchedByName.length === 0) {
          continue;
        }

        let targetOrders = matchedByName;

        if (matchedByName.length > 1) {
          const ordToken = extractOrdToken(originalFolderName);

          if (!ordToken) {
            throw new Error(
              `Nama folder \"${originalFolderName}\" ambigu. Tambahkan kode invoice berawalan ORD pada nama folder, contoh: \"${originalFolderName} ORD-XXXX\".`,
            );
          }

          const matchedByOrd = matchedByName.filter((order) => {
            const invoiceNumber =
              order.invoice?.invoiceNumber ??
              `ORD-${order.id.slice(0, 8).toUpperCase()}`;
            const normalizedInvoice = normalizeInvoiceToken(invoiceNumber);
            return normalizedInvoice.includes(ordToken);
          });

          if (matchedByOrd.length === 0) {
            throw new Error(
              `Kode ${ordToken} pada folder \"${originalFolderName}\" tidak cocok dengan invoice transaksi pequrban yang namanya sama.`,
            );
          }

          if (matchedByOrd.length > 1) {
            throw new Error(
              `Kode ${ordToken} pada folder \"${originalFolderName}\" masih ambigu. Gunakan kode ORD yang lebih spesifik sesuai invoice transaksi.`,
            );
          }

          targetOrders = matchedByOrd;
        }

        if (targetOrders.length === 0) {
          continue;
        }

        matchedFolderCount += 1;

        for (const order of targetOrders) {
          if (order.animalGroupId) {
            if (!photosByGroupId.has(order.animalGroupId)) {
              photosByGroupId.set(order.animalGroupId, []);
            }
            photosByGroupId.get(order.animalGroupId)?.push(...photos);
            continue;
          }

          if (!photosByOrderId.has(order.id)) {
            photosByOrderId.set(order.id, []);
          }
          photosByOrderId.get(order.id)?.push(...photos);
        }
      }

      if (matchedFolderCount === 0) {
        throw new Error("Tidak ada folder yang cocok dengan nama pequrban.");
      }

      const orderIds = Array.from(photosByOrderId.keys());
      const groupIds = Array.from(photosByGroupId.keys());

      if (orderIds.length > 0) {
        await tx.documentation.deleteMany({
          where: {
            orderId: {
              in: orderIds,
            },
            stage: "STAGE_1",
            mediaType: "IMAGE",
          },
        });
      }

      if (groupIds.length > 0) {
        await tx.documentation.deleteMany({
          where: {
            animalGroupId: {
              in: groupIds,
            },
            stage: "STAGE_1",
            mediaType: "IMAGE",
          },
        });
      }

      await tx.documentation.createMany({
        data: [
          ...orderIds.flatMap((orderId) =>
            (photosByOrderId.get(orderId) ?? []).map((photo) => ({
              orderId,
              stage: "STAGE_1" as ReportStage,
              mediaType: "IMAGE" as const,
              mediaUrl: photo.dataUrl,
              description: photo.fileName,
            })),
          ),
          ...groupIds.flatMap((groupId) =>
            (photosByGroupId.get(groupId) ?? []).map((photo) => ({
              animalGroupId: groupId,
              stage: "STAGE_1" as ReportStage,
              mediaType: "IMAGE" as const,
              mediaUrl: photo.dataUrl,
              description: photo.fileName,
            })),
          ),
        ],
      });

      const distributedOrderIds = new Set(orderIds);

      if (groupIds.length > 0) {
        const groupedOrders = await tx.order.findMany({
          where: {
            animalGroupId: {
              in: groupIds,
            },
          },
          select: {
            id: true,
          },
        });

        for (const order of groupedOrders) {
          distributedOrderIds.add(order.id);
        }
      }

      return {
        matchedFolderCount,
        distributedOrderCount: distributedOrderIds.size,
      };
    },
    {
      timeout: 30000,
    },
  );
}

export async function listDocumentationDistributionYears(
  query: DocumentationYearsQuery,
) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 10));
  const searchKeyword = query.search?.trim();

  const customerOrders = await prisma.order.findMany({
    where: {
      user: {
        role: UserRole.CUSTOMER,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const years = Array.from(
    new Set(customerOrders.map((order) => order.createdAt.getFullYear())),
  ).sort((a, b) => b - a);

  const filteredYears = years.filter((year) => {
    if (!searchKeyword) {
      return true;
    }

    return String(year).includes(searchKeyword);
  });

  const total = filteredYears.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pagedYears = filteredYears.slice(start, start + pageSize);

  const data = await Promise.all(
    pagedYears.map(async (year) => {
      const { startDate, endDate } = getYearRange(year);

      const latestVideoDoc = await prisma.documentation.findFirst({
        where: {
          mediaType: "VIDEO",
          stage: "STAGE_2",
          order: {
            createdAt: {
              gte: startDate,
              lt: endDate,
            },
            user: {
              role: UserRole.CUSTOMER,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          createdAt: true,
        },
      });

      return {
        year,
        uploadDate: latestVideoDoc
          ? formatLongDate(latestVideoDoc.createdAt)
          : "",
        status: latestVideoDoc
          ? ("Tersedia" as const)
          : ("Belum Tersedia" as const),
      };
    }),
  );

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

export async function getDocumentationDistributionYearDetail(year: number) {
  const { startDate, endDate } = getYearRange(year);

  const totalTransactions = await prisma.order.count({
    where: {
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
      user: {
        role: UserRole.CUSTOMER,
      },
    },
  });

  const latestVideoDoc = await prisma.documentation.findFirst({
    where: {
      mediaType: "VIDEO",
      stage: "STAGE_2",
      order: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        user: {
          role: UserRole.CUSTOMER,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      mediaUrl: true,
      description: true,
      createdAt: true,
    },
  });

  return {
    year,
    totalTransactions,
    latestVideo: latestVideoDoc
      ? {
        mediaUrl: latestVideoDoc.mediaUrl,
        fileName: latestVideoDoc.description,
        uploadedAt: latestVideoDoc.createdAt,
      }
      : null,
  };
}
