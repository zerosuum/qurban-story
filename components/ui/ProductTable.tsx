"use client";

import { useEffect, useState } from "react";
import Pagination from "./Pagination";
import StatusAlert from "./StatusAlert";
import ConfirmationPopup from "./ConfirmationPopup";
import EditProdukModal from "./EditProdukModal";
import DetailProdukModal from "./DetailProdukModal";
import type { TambahProdukForm } from "./TambahProdukModal";

type ProductStatus = "AKTIF" | "TIDAK AKTIF";

type ActionAlert = {
    type: "success" | "error";
    title: string;
    message: string;
};

type ProductRow = {
    id: string;
    code: string;
    product: string;
    weight: string;
    type: string;
    price: string;
    promoPrice: string;
    stock: string;
    status: ProductStatus;
};

type ProductTableProps = {
    searchQuery: string;
    refreshKey?: number;
};

const PAGE_SIZE = 10;
type ProductsApiResponse = {
    data: Array<{
        id: string;
        name: string;
        weight: string | null;
        price: string;
        promoPrice: string | null;
        stock: number;
        isActive: boolean;
    }>;
    pagination: {
        page: number;
        totalPages: number;
    };
};

type ProductDetailApiResponse = {
    data: {
        id: string;
        name: string;
        description: string | null;
        weight: string | null;
        price: string;
        promoPrice: string | null;
        discountType: string | null;
        discountValue: string | null;
        discountStartDate: string | null;
        discountEndDate: string | null;
        stock: number;
        isActive: boolean;
        images?: Array<{
            imageUrl: string;
        }>;
    };
};

function inferProductType(name: string) {
    return name.toLowerCase().includes("patungan") ? "Patungan (1/7)" : "Full";
}

function parseNumericString(value: string) {
    const normalized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
}

function mapDetailToForm(product: ProductDetailApiResponse["data"]): TambahProdukForm {
    const discountLabel =
        product.discountType === "PERCENTAGE" && product.discountValue
            ? `${Math.round(Number(product.discountValue))}%`
            : "";

    const toInputDate = (value: string | null) => {
        if (!value) {
            return "";
        }

        const parsed = new Date(value);

        if (Number.isNaN(parsed.getTime())) {
            return "";
        }

        return parsed.toISOString().slice(0, 10);
    };

    return {
        namaProduk: product.name,
        tipe: inferProductType(product.name),
        berat: product.weight ?? "",
        stok: String(product.stock),
        harga: `Rp ${formatRupiah(product.price)}`,
        diskon: discountLabel,
        periodeDiskonMulai: toInputDate(product.discountStartDate),
        periodeDiskonSelesai: toInputDate(product.discountEndDate),
        deskripsi: product.description ?? "",
    };
}

function formatRupiah(value: string) {
    const number = Number(value);

    if (Number.isNaN(number)) {
        return value;
    }

    return new Intl.NumberFormat("id-ID").format(number);
}

function mapApiProductToRow(product: ProductsApiResponse["data"][number]): ProductRow {
    const inferredType = inferProductType(product.name);

    return {
        id: product.id,
        code: `PRD-${product.id.slice(0, 6).toUpperCase()}`,
        product: product.name,
        weight: product.weight ?? "-",
        type: inferredType,
        price: formatRupiah(product.price),
        promoPrice: product.promoPrice ? formatRupiah(product.promoPrice) : "-",
        stock: String(product.stock),
        status: product.isActive ? "AKTIF" : "TIDAK AKTIF",
    };
}

export default function ProductTable({ searchQuery, refreshKey = 0 }: ProductTableProps) {
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [localRefreshKey, setLocalRefreshKey] = useState(0);

    const [actionAlert, setActionAlert] = useState<ActionAlert | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [selectedProductForm, setSelectedProductForm] = useState<TambahProdukForm | null>(null);
    const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([]);
    const [modalLoadingType, setModalLoadingType] = useState<"detail" | "edit" | null>(null);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    useEffect(() => {
        if (!actionAlert) {
            return;
        }

        const timer = window.setTimeout(() => {
            setActionAlert(null);
        }, 3500);

        return () => window.clearTimeout(timer);
    }, [actionAlert]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchProducts = async () => {
            setIsLoading(true);
            setFetchError(null);
            setProducts([]);

            try {
                const query = new URLSearchParams({
                    page: String(page),
                    pageSize: String(PAGE_SIZE),
                });

                if (searchQuery.trim()) {
                    query.set("search", searchQuery.trim());
                }

                const response = await fetch(`/api/products?${query.toString()}`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Gagal mengambil data produk.");
                }

                const result = (await response.json()) as ProductsApiResponse;
                setProducts(result.data.map(mapApiProductToRow));
                setTotalPages(Math.max(1, result.pagination.totalPages ?? 1));
            } catch (error) {
                if ((error as Error).name === "AbortError") {
                    return;
                }

                setProducts([]);
                setFetchError("Data produk gagal dimuat.");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchProducts();

        return () => controller.abort();
    }, [page, refreshKey, localRefreshKey, searchQuery]);

    useEffect(() => {
        setPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

    const goPrev = () => setPage((prev) => Math.max(1, prev - 1));
    const goNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

    const fetchProductDetail = async (productId: string) => {
        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
            throw new Error("Gagal mengambil detail produk.");
        }

        const result = (await response.json()) as ProductDetailApiResponse;
        return result.data;
    };

    const openDetailModal = async (productId: string) => {
        setModalLoadingType("detail");

        try {
            const detail = await fetchProductDetail(productId);
            setSelectedProductId(detail.id);
            setSelectedProductForm(mapDetailToForm(detail));
            setSelectedImageUrls(detail.images?.map((image) => image.imageUrl) ?? []);
            setIsDetailModalOpen(true);
        } catch {
            setActionAlert({
                type: "error",
                title: "Terjadi Kesalahan.",
                message: "Detail produk tidak dapat dimuat.",
            });
        } finally {
            setModalLoadingType(null);
        }
    };

    const openEditModal = async (productId: string) => {
        setModalLoadingType("edit");

        try {
            const detail = await fetchProductDetail(productId);
            setSelectedProductId(detail.id);
            setSelectedProductForm(mapDetailToForm(detail));
            setSelectedImageUrls(detail.images?.map((image) => image.imageUrl) ?? []);
            setIsEditModalOpen(true);
        } catch {
            setActionAlert({
                type: "error",
                title: "Terjadi Kesalahan.",
                message: "Data produk tidak dapat dimuat untuk edit.",
            });
        } finally {
            setModalLoadingType(null);
        }
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleEditProduct = async (formData: TambahProdukForm, imageFiles: File[], existingImageUrls: string[]) => {
        if (!selectedProductId) {
            throw new Error("Produk belum dipilih.");
        }

        const stockNumber = Number(formData.stok);

        if (Number.isNaN(stockNumber)) {
            throw new Error("Stok harus berupa angka.");
        }

        const payload = new FormData();
        payload.append("name", formData.namaProduk);
        payload.append("type", formData.tipe);
        payload.append("description", formData.deskripsi || "");
        payload.append("weight", formData.berat || "");
        payload.append("price", String(parseNumericString(formData.harga)));
        payload.append("stock", String(stockNumber));
        payload.append("discount", formData.diskon || "");
        payload.append("discountStartDate", formData.periodeDiskonMulai || "");
        payload.append("discountEndDate", formData.periodeDiskonSelesai || "");

        for (const imageUrl of existingImageUrls) {
            payload.append("existingImageUrls", imageUrl);
        }

        for (const file of imageFiles) {
            payload.append("images", file);
        }

        const response = await fetch(`/api/products/${selectedProductId}`, {
            method: "PUT",
            body: payload,
        });

        if (!response.ok) {
            throw new Error("Gagal memperbarui produk.");
        }
    };

    const handleEditResult = (status: "success" | "error") => {
        if (status === "success") {
            setLocalRefreshKey((prev) => prev + 1);
            setActionAlert({
                type: "success",
                title: "Berhasil!",
                message: "Produk berhasil diperbarui.",
            });
            return;
        }

        setActionAlert({
            type: "error",
            title: "Terjadi Kesalahan.",
            message: "Produk tidak dapat diperbarui.",
        });
    };

    const requestDeleteProduct = (id: string, code: string) => {
        setDeleteTarget({ id, code });
        setIsDeleteConfirmOpen(true);
    };

    const cancelDeleteProduct = () => {
        setIsDeleteConfirmOpen(false);
        setDeleteTarget(null);
        setIsDeleting(false);
    };

    const confirmDeleteProduct = async () => {
        if (!deleteTarget) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/products/${deleteTarget.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Gagal menghapus produk.");
            }

            setLocalRefreshKey((prev) => prev + 1);
            setActionAlert({
                type: "success",
                title: "Berhasil!",
                message: `Produk ${deleteTarget.code} berhasil dihapus.`,
            });
            cancelDeleteProduct();
        } catch {
            setActionAlert({
                type: "error",
                title: "Terjadi Kesalahan.",
                message: "Produk tidak dapat dihapus.",
            });
            setIsDeleting(false);
        }
    };

    const toggleStatus = async (productId: string, nextStatus: ProductStatus) => {
        const previousProducts = products;

        setProducts((prev) =>
            prev.map((item) =>
                item.id === productId
                    ? { ...item, status: nextStatus }
                    : item
            )
        );

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isActive: nextStatus === "AKTIF" }),
            });

            if (!response.ok) {
                throw new Error("Gagal mengubah status.");
            }
        } catch {
            setProducts(previousProducts);
        }
    };

    return (
        <>
            <StatusAlert
                isOpen={Boolean(actionAlert)}
                type={actionAlert?.type ?? "success"}
                title={actionAlert?.title ?? ""}
                message={actionAlert?.message ?? ""}
            />

            {modalLoadingType && (
                <div className="fixed inset-0 z-[115] flex items-center justify-center bg-neutral-800/35 p-4 backdrop-blur-[1px]">
                    <div className="w-full max-w-[420px] rounded-xl border border-neutral-100 bg-white p-6 shadow-[0_8px_28px_-6px_rgba(24,39,75,0.12),0_18px_88px_-4px_rgba(24,39,75,0.14)]">
                        <div className="flex items-center gap-3">
                            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-500" />
                            <div>
                                <p className="font-semibold text-black">Memuat data produk...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <section className="w-full rounded-xl border border-neutral-100 bg-white p-4 md:p-5">
                <div className="overflow-x-auto rounded-xl border border-neutral-100">
                    <table className="w-full min-w-260 border-collapse">
                        <thead>
                            <tr className="bg-primary-500 text-left text-white">
                                <th className="px-4 py-3 font-semibold">Kode Hewan</th>
                                <th className="px-4 py-3 font-semibold">Produk</th>
                                <th className="px-4 py-3 font-semibold">Berat</th>
                                <th className="px-4 py-3 font-semibold">Tipe</th>
                                <th className="px-4 py-3 font-semibold">Harga (Rp)</th>
                                <th className="px-4 py-3 font-semibold">Harga Promo</th>
                                <th className="px-4 py-3 font-semibold">Stok</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white">
                            {products.map((item) => {
                                const isActive = item.status === "AKTIF";

                                return (
                                    <tr key={item.id} className="border-t border-neutral-50">
                                        <td className="px-4 py-3 text-neutral-900">{item.code}</td>
                                        <td className="px-4 py-3 text-neutral-900">{item.product}</td>
                                        <td className="px-4 py-3 text-neutral-900">{item.weight}</td>
                                        <td className="px-4 py-3 text-neutral-900">{item.type}</td>
                                        <td className="px-4 py-3 text-neutral-900">{item.price}</td>
                                        <td className="px-4 py-3 text-neutral-900">{item.promoPrice}</td>
                                        <td className="px-4 py-3 text-neutral-900">{item.stock}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleStatus(item.id, isActive ? "TIDAK AKTIF" : "AKTIF")}
                                                    className="inline-flex h-6 w-10 cursor-pointer items-center"
                                                    aria-label={`Ubah status ${item.code}`}
                                                    aria-pressed={isActive}
                                                >
                                                    <img
                                                        src={isActive ? "/icons/on_switch.svg" : "/icons/off_switch.svg"}
                                                        alt=""
                                                        className="h-6 w-10"
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                                <span className="text-xs font-medium text-neutral-500">{item.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2 text-lg">
                                                <button
                                                    type="button"
                                                    aria-label={`Lihat detail ${item.code}`}
                                                    className="cursor-pointer text-green-700 transition-opacity hover:opacity-80"
                                                    onClick={() => void openDetailModal(item.id)}
                                                >
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-label={`Edit ${item.code}`}
                                                    className="cursor-pointer text-sky-600 transition-opacity hover:opacity-80"
                                                    onClick={() => void openEditModal(item.id)}
                                                >
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M12 20h9" />
                                                        <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-label={`Hapus ${item.code}`}
                                                    className="cursor-pointer text-red-600 transition-opacity hover:opacity-80"
                                                    onClick={() => requestDeleteProduct(item.id, item.code)}
                                                >
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M3 6h18" />
                                                        <path d="M8 6V4h8v2" />
                                                        <path d="M19 6v14H5V6" />
                                                        <path d="M10 11v6" />
                                                        <path d="M14 11v6" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {isLoading && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500"></div>
                                            <p className="text-center font-medium text-neutral-600">Memuat data produk...</p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!isLoading && fetchError && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-6 text-center text-red-400">
                                        {fetchError}
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !fetchError && products.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-6 text-center text-neutral-400">
                                        Data produk tidak ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} totalPages={totalPages} onPrev={goPrev} onNext={goNext} />
            </section>

            <DetailProdukModal
                isOpen={isDetailModalOpen && Boolean(selectedProductForm)}
                onClose={closeDetailModal}
                product={selectedProductForm ?? {
                    namaProduk: "",
                    tipe: "Full",
                    berat: "",
                    stok: "",
                    harga: "",
                    diskon: "",
                    periodeDiskonMulai: "",
                    periodeDiskonSelesai: "",
                    deskripsi: "",
                }}
                imageUrls={selectedImageUrls}
            />

            <EditProdukModal
                isOpen={isEditModalOpen && Boolean(selectedProductForm)}
                onClose={closeEditModal}
                initialData={selectedProductForm ?? {
                    namaProduk: "",
                    tipe: "Full",
                    berat: "",
                    stok: "",
                    harga: "",
                    diskon: "",
                    periodeDiskonMulai: "",
                    periodeDiskonSelesai: "",
                    deskripsi: "",
                }}
                initialImageUrls={selectedImageUrls}
                onSubmitProduct={handleEditProduct}
                onSubmitResult={handleEditResult}
            />

            <ConfirmationPopup
                isOpen={isDeleteConfirmOpen}
                title="Konfirmasi Hapus"
                message={`Apakah Anda yakin ingin menghapus produk ${deleteTarget?.code ?? "ini"}?`}
                confirmLabel="Ya, Hapus"
                cancelLabel="Batal"
                isLoading={isDeleting}
                onCancel={cancelDeleteProduct}
                onConfirm={() => void confirmDeleteProduct()}
            />
        </>
    );
}