import { Prisma, GroupStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ProductQuery = {
  search?: string;
  page?: number;
  pageSize?: number;
  isActive?: boolean;
};

type ProductPayload = {
  speciesId?: string;
  type?: string;
  name: string;
  description?: string | null;
  weight?: string | null;
  price: number | string;
  promoPrice?: number | string | null;
  discountType?: string | null;
  discountValue?: number | string | null;
  discountStartDate?: string | Date | null;
  discountEndDate?: string | Date | null;
  imageUrls?: string[];
  stock: number;
  isActive?: boolean;
};

function toDecimal(value: number | string) {
  if (typeof value === "number") {
    return new Prisma.Decimal(value);
  }

  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return new Prisma.Decimal(normalized);
}

async function resolveSpeciesId(speciesId?: string, productType?: string) {
  if (speciesId) {
    const species = await prisma.animalSpecies.findUnique({
      where: { id: speciesId },
    });

    if (!species) {
      throw new Error("Spesies tidak ditemukan.");
    }

    return species.id;
  }

  const isPatungan = productType?.toLowerCase().includes("patungan");
  const targetCapacity = isPatungan ? 7 : 1;

  let suitableSpecies = await prisma.animalSpecies.findFirst({
    where: { maxParticipants: targetCapacity },
  });

  if (!suitableSpecies) {
    suitableSpecies = await prisma.animalSpecies.create({
      data: {
        name: isPatungan ? "Hewan Patungan (Auto)" : "Hewan Full (Auto)",
        maxParticipants: targetCapacity,
      },
    });
  }

  return suitableSpecies.id;
}

function shouldAppendTypeToName(type?: string) {
  if (!type) {
    return false;
  }

  const normalizedType = type.trim().toLowerCase();
  return normalizedType !== "" && normalizedType !== "full";
}

function mapProduct(product: {
  id: string;
  speciesId: string;
  name: string;
  description: string | null;
  weight: string | null;
  price: Prisma.Decimal;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  promos?: Array<{
    discountType: string | null;
    discountValue: Prisma.Decimal;
    startDate: Date;
    endDate: Date | null;
  }>;
  images?: Array<{
    id: string;
    imageUrl: string;
    isPrimary: boolean;
    createdAt: Date;
  }>;
  groups?: Array<{
    currentSlot: number;
    maxSlot: number;
    status: GroupStatus;
  }>;
}) {
  const activePromo = product.promos?.[0];

  let promoPrice: string | null = null;

  if (activePromo) {
    const promoValue = Number(activePromo.discountValue.toString());
    const basePrice = Number(product.price.toString());

    if (activePromo.discountType === "PERCENTAGE") {
      promoPrice = Math.max(
        0,
        basePrice - (basePrice * promoValue) / 100,
      ).toString();
    } else if (
      activePromo.discountType === "NOMINAL" ||
      activePromo.discountType === "FIXED_AMOUNT"
    ) {
      promoPrice = Math.max(0, basePrice - promoValue).toString();
    } else {
      promoPrice = activePromo.discountValue.toString();
    }
  }

  return {
    ...product,
    price: product.price.toString(),
    promoPrice,
    discountType: activePromo?.discountType ?? null,
    discountValue: activePromo?.discountValue?.toString() ?? null,
    discountStartDate: activePromo?.startDate?.toISOString() ?? null,
    discountEndDate: activePromo?.endDate?.toISOString() ?? null,
    images:
      product.images?.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        isPrimary: image.isPrimary,
      })) ?? [],
    animalGroups:
      product.groups?.map((group) => ({
        currentSlot: group.currentSlot,
        maxSlot: group.maxSlot,
        status: group.status,
      })) ?? [],
    promos: undefined,
    groups: undefined,
  };
}

export async function listProducts(query: ProductQuery) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 25));
  const skip = (page - 1) * pageSize;
  const keyword = query.search?.trim();
  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const where: Prisma.ProductWhereInput = {
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(keyword
      ? {
        OR: [
          { name: { contains: keyword, mode: "insensitive" } },
          { weight: { contains: keyword, mode: "insensitive" } },
          { description: { contains: keyword, mode: "insensitive" } },
        ],
      }
      : {}),
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        promos: {
          where: {
            isActive: true,
            startDate: { lte: now },
            OR: [{ endDate: null }, { endDate: { gte: todayStart } }],
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        images: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
        groups: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products.map(mapProduct),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getProductById(id: string) {
  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      promos: {
        where: {
          isActive: true,
          startDate: { lte: now },
          OR: [{ endDate: null }, { endDate: { gte: todayStart } }],
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      groups: true,
    },
  });

  if (!product) {
    return null;
  }

  return mapProduct(product);
}

export async function createProduct(payload: ProductPayload) {
  const speciesId = await resolveSpeciesId(payload.speciesId, payload.type);
  const hasDiscount =
    payload.discountType !== undefined &&
    payload.discountType !== null &&
    payload.discountValue !== undefined &&
    payload.discountValue !== null &&
    `${payload.discountValue}`.trim() !== "";

  const computedName =
    shouldAppendTypeToName(payload.type) &&
      !payload.name.toLowerCase().includes((payload.type as string).toLowerCase())
      ? `${payload.name} (${payload.type})`
      : payload.name;

  const product = await prisma.product.create({
    data: {
      speciesId,
      name: computedName,
      description: payload.description ?? null,
      weight: payload.weight ?? null,
      price: toDecimal(payload.price),
      stock: payload.stock,
      isActive: payload.isActive ?? true,
      promos: hasDiscount
        ? {
          create: {
            discountType: payload.discountType,
            discountValue: toDecimal(
              payload.discountValue as string | number,
            ),
            startDate: payload.discountStartDate
              ? new Date(payload.discountStartDate)
              : new Date(),
            endDate: payload.discountEndDate
              ? new Date(payload.discountEndDate)
              : null,
            isActive: true,
          },
        }
        : undefined,
      images:
        payload.imageUrls && payload.imageUrls.length > 0
          ? {
            create: payload.imageUrls.map((imageUrl, index) => ({
              imageUrl,
              isPrimary: index === 0,
            })),
          }
          : undefined,
    },
    include: {
      promos: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  return mapProduct(product);
}

export async function updateProduct(
  id: string,
  payload: Partial<ProductPayload>,
) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const data: Prisma.ProductUpdateInput = {};

  if (payload.speciesId !== undefined || payload.type !== undefined) {
    data.species = {
      connect: {
        id: await resolveSpeciesId(payload.speciesId, payload.type),
      },
    };
  }

  if (payload.name !== undefined) data.name = payload.name;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.weight !== undefined) data.weight = payload.weight;
  if (payload.price !== undefined) data.price = toDecimal(payload.price);
  if (payload.stock !== undefined) data.stock = payload.stock;
  if (payload.isActive !== undefined) data.isActive = payload.isActive;

  if (payload.type !== undefined && payload.name !== undefined) {
    const isTypeIncluded = payload.name
      .toLowerCase()
      .includes(payload.type.toLowerCase());
    data.name =
      shouldAppendTypeToName(payload.type) && !isTypeIncluded
        ? `${payload.name} (${payload.type})`
        : payload.name;
  }

  await prisma.product.update({
    where: { id },
    data,
    include: {
      promos: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  const hasDiscountPayload =
    payload.discountType !== undefined ||
    payload.discountValue !== undefined ||
    payload.discountStartDate !== undefined ||
    payload.discountEndDate !== undefined ||
    payload.promoPrice !== undefined;

  if (hasDiscountPayload) {
    await prisma.promo.updateMany({
      where: { productId: id, isActive: true },
      data: { isActive: false, endDate: new Date() },
    });

    const discountType = payload.discountType ?? null;
    const discountValue = payload.discountValue ?? null;

    if (
      discountType &&
      discountValue !== null &&
      `${discountValue}`.trim() !== ""
    ) {
      await prisma.promo.create({
        data: {
          productId: id,
          discountType,
          discountValue: toDecimal(discountValue as string | number),
          startDate: payload.discountStartDate
            ? new Date(payload.discountStartDate)
            : new Date(),
          endDate: payload.discountEndDate
            ? new Date(payload.discountEndDate)
            : null,
          isActive: true,
        },
      });
    }
  }

  if (payload.imageUrls !== undefined) {
    await prisma.productImage.deleteMany({ where: { productId: id } });

    if (payload.imageUrls.length > 0) {
      await prisma.productImage.createMany({
        data: payload.imageUrls.map((imageUrl, index) => ({
          productId: id,
          imageUrl,
          isPrimary: index === 0,
        })),
      });
    }
  }

  const refreshedProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      promos: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!refreshedProduct) {
    return null;
  }

  return mapProduct(refreshedProduct);
}

export async function deleteProduct(id: string) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return { status: "not_found" as const };
  }

  const transactionCount = await prisma.order.count({
    where: { productId: id },
  });

  if (transactionCount > 0) {
    return { status: "has_transactions" as const };
  }

  await prisma.product.delete({ where: { id } });
  return { status: "deleted" as const };
}
