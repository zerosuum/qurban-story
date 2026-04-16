import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "@/lib/products/product.service";

function parsePositiveInt(value: string | null, defaultValue: number) {
  if (!value) {
    return defaultValue;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return defaultValue;
  }

  return parsed;
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function parseBoolean(value: unknown, defaultValue: boolean) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }

  return defaultValue;
}

function parseDiscount(discountRaw: string | null) {
  if (!discountRaw || discountRaw.trim() === "") {
    return {
      discountType: null,
      discountValue: null,
    };
  }

  const normalized = discountRaw.trim().replace(/\s/g, "");

  if (normalized.endsWith("%")) {
    const percentage = Number(normalized.slice(0, -1));

    if (Number.isNaN(percentage)) {
      throw new Error("Format diskon persen tidak valid.");
    }

    if (percentage <= 0) {
      return {
        discountType: null,
        discountValue: null,
      };
    }

    return {
      discountType: "PERCENTAGE",
      discountValue: percentage.toString(),
    };
  }

  const nominal = Number(normalized.replace(/[^\d.-]/g, ""));

  if (Number.isNaN(nominal)) {
    throw new Error("Format diskon nominal tidak valid.");
  }

  if (nominal <= 0) {
    return {
      discountType: null,
      discountValue: null,
    };
  }

  return {
    discountType: "NOMINAL",
    discountValue: nominal.toString(),
  };
}

async function storeUploadedImages(files: File[]) {
  if (files.length === 0) {
    return [];
  }

  const uploadDir = path.join(process.cwd(), "public", "hewan");
  await mkdir(uploadDir, { recursive: true });

  const imageUrls: string[] = [];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = sanitizeFilename(file.name || "image.jpg");
    const filename = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const destination = path.join(uploadDir, filename);

    await writeFile(destination, buffer);
    imageUrls.push(`/hewan/${filename}`);
  }

  return imageUrls;
}

function normalizeCreatePayload(body: unknown) {
  const data = body as Record<string, unknown>;

  const name = typeof data.name === "string" ? data.name.trim() : "";
  const price = data.price;
  const stock = typeof data.stock === "number" ? data.stock : Number(data.stock);

  if (!name) {
    throw new Error("Nama produk wajib diisi.");
  }

  if (price === undefined || price === null || price === "") {
    throw new Error("Harga produk wajib diisi.");
  }

  if (Number.isNaN(stock)) {
    throw new Error("Stok produk harus berupa angka.");
  }

  const discountType = typeof data.discountType === "string" ? data.discountType : null;
  const discountValue =
    typeof data.discountValue === "string" || typeof data.discountValue === "number"
      ? String(data.discountValue)
      : null;

  if ((discountType && !discountValue) || (!discountType && discountValue)) {
    throw new Error("Diskon tidak lengkap.");
  }

  return {
    speciesId: typeof data.speciesId === "string" ? data.speciesId : undefined,
    type: typeof data.type === "string" ? data.type : undefined,
    name,
    description: typeof data.description === "string" ? data.description : null,
    weight: typeof data.weight === "string" ? data.weight : null,
    price: typeof price === "string" || typeof price === "number" ? price : "0",
    discountType,
    discountValue,
    discountStartDate:
      typeof data.discountStartDate === "string" && data.discountStartDate.trim() !== ""
        ? data.discountStartDate
        : null,
    discountEndDate:
      typeof data.discountEndDate === "string" && data.discountEndDate.trim() !== ""
        ? data.discountEndDate
        : null,
    imageUrls: Array.isArray(data.imageUrls)
      ? data.imageUrls.filter((value): value is string => typeof value === "string")
      : [],
    stock,
    isActive: parseBoolean(data.isActive, true),
  };
}

function normalizeUpdatePayload(body: unknown) {
  const data = body as Record<string, unknown>;
  const stockValue = data.stock !== undefined ? Number(data.stock) : undefined;
  const discountType =
    typeof data.discountType === "string" && data.discountType.trim() !== ""
      ? data.discountType
      : null;
  const discountValue =
    typeof data.discountValue === "string" || typeof data.discountValue === "number"
      ? String(data.discountValue)
      : null;

  return {
    speciesId: typeof data.speciesId === "string" ? data.speciesId : undefined,
    type: typeof data.type === "string" ? data.type : undefined,
    name: typeof data.name === "string" ? data.name.trim() : undefined,
    description: typeof data.description === "string" ? data.description : undefined,
    weight: typeof data.weight === "string" ? data.weight : undefined,
    price:
      typeof data.price === "string" || typeof data.price === "number"
        ? data.price
        : undefined,
    promoPrice:
      typeof data.promoPrice === "string" || typeof data.promoPrice === "number"
        ? data.promoPrice
        : undefined,
    discountType,
    discountValue,
    discountStartDate:
      typeof data.discountStartDate === "string" && data.discountStartDate.trim() !== ""
        ? data.discountStartDate
        : null,
    discountEndDate:
      typeof data.discountEndDate === "string" && data.discountEndDate.trim() !== ""
        ? data.discountEndDate
        : null,
    imageUrls: Array.isArray(data.imageUrls)
      ? data.imageUrls.filter((value): value is string => typeof value === "string")
      : undefined,
    stock: stockValue !== undefined && !Number.isNaN(stockValue) ? stockValue : undefined,
    isActive: typeof data.isActive === "boolean" ? data.isActive : undefined,
  };
}

export async function handleListProducts(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get("isActive");
    let isActiveFilter: boolean | undefined;

    if (isActiveParam !== null) {
      isActiveFilter = isActiveParam.toLowerCase() === "true";
    }

    const result = await listProducts({
      search: searchParams.get("search") ?? undefined,
      page: parsePositiveInt(searchParams.get("page"), 1),
      pageSize: parsePositiveInt(searchParams.get("pageSize"), 10),
      isActive: isActiveFilter,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data produk.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function handleCreateProduct(request: Request) {
  try {
    let body: Record<string, unknown>;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const discountRaw = typeof formData.get("discount") === "string" ? String(formData.get("discount")) : null;
      const parsedDiscount = parseDiscount(discountRaw);
      const files = formData
        .getAll("images")
        .filter((item): item is File => item instanceof File && item.size > 0);
      const imageUrls = await storeUploadedImages(files);

      body = {
        speciesId: formData.get("speciesId"),
        type: formData.get("type"),
        name: formData.get("name"),
        description: formData.get("description"),
        weight: formData.get("weight"),
        price: formData.get("price"),
        stock: formData.get("stock"),
        isActive: formData.get("isActive"),
        discountType: parsedDiscount.discountType,
        discountValue: parsedDiscount.discountValue,
        discountStartDate: formData.get("discountStartDate"),
        discountEndDate: formData.get("discountEndDate"),
        imageUrls,
      };
    } else {
      body = (await request.json()) as Record<string, unknown>;
    }

    const payload = normalizeCreatePayload(body);
    const product = await createProduct(payload);

    return NextResponse.json(
      { message: "Produk berhasil ditambahkan.", data: product },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menambahkan produk.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function handleGetProduct(id: string) {
  try {
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ message: "Produk tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ data: product }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil detail produk.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function handleUpdateProduct(id: string, request: Request) {
  try {
    let body: Record<string, unknown>;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const discountRaw =
        typeof formData.get("discount") === "string" ? String(formData.get("discount")) : null;
      const parsedDiscount = parseDiscount(discountRaw);
      const files = formData
        .getAll("images")
        .filter((item): item is File => item instanceof File && item.size > 0);
      const newImageUrls = await storeUploadedImages(files);
      const existingImageUrls = formData
        .getAll("existingImageUrls")
        .filter((item): item is string => typeof item === "string" && item.trim() !== "");

      body = {
        speciesId: formData.get("speciesId"),
        type: formData.get("type"),
        name: formData.get("name"),
        description: formData.get("description"),
        weight: formData.get("weight"),
        price: formData.get("price"),
        stock: formData.get("stock"),
        isActive: formData.get("isActive"),
        discountType: parsedDiscount.discountType,
        discountValue: parsedDiscount.discountValue,
        discountStartDate: formData.get("discountStartDate"),
        discountEndDate: formData.get("discountEndDate"),
        imageUrls: [...existingImageUrls, ...newImageUrls],
      };
    } else {
      body = (await request.json()) as Record<string, unknown>;
    }

    const payload = normalizeUpdatePayload(body);
    const product = await updateProduct(id, payload);

    if (!product) {
      return NextResponse.json({ message: "Produk tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Produk berhasil diperbarui.", data: product },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui produk.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function handleDeleteProduct(id: string) {
  try {
    const deleted = await deleteProduct(id);

    if (!deleted) {
      return NextResponse.json({ message: "Produk tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ message: "Produk berhasil dihapus." }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus produk.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
