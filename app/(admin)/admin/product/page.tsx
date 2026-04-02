"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import ProductTable from "@/components/ui/ProductTable";
import SearchBar from "@/components/ui/SearchBar";
import TambahProdukModal from "@/components/ui/TambahProdukModal";
import StatusAlert from "@/components/ui/StatusAlert";
import type { TambahProdukForm } from "@/components/ui/TambahProdukModal";

type SubmitAlert = {
    type: "success" | "error";
    title: string;
    message: string;
};

export default function ProductPage() {
    const [search, setSearch] = useState("");
    const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
    const [submitAlert, setSubmitAlert] = useState<SubmitAlert | null>(null);
    const [productTableRefreshKey, setProductTableRefreshKey] = useState(0);

    useEffect(() => {
        if (!submitAlert) {
            return;
        }

        const timer = window.setTimeout(() => {
            setSubmitAlert(null);
        }, 4200);

        return () => window.clearTimeout(timer);
    }, [submitAlert]);

    const handleSubmitResult = (status: "success" | "error") => {
        if (status === "success") {
            setProductTableRefreshKey((prev) => prev + 1);
            setSubmitAlert({
                type: "success",
                title: "Berhasil!",
                message: "Produk baru berhasil ditambahkan.",
            });
            return;
        }

        setSubmitAlert({
            type: "error",
            title: "Terjadi Kesalahan.",
            message: "Produk baru tidak dapat ditambahkan.",
        });
    };

    const handleCreateProduct = async (formData: TambahProdukForm, imageFiles: File[]) => {
        const stockAsNumber = Number(formData.stok);

        if (Number.isNaN(stockAsNumber)) {
            throw new Error("Stok harus berupa angka.");
        }

        const payload = new FormData();
        payload.append("name", formData.namaProduk);
        payload.append("type", formData.tipe);
        payload.append("description", formData.deskripsi || "");
        payload.append("weight", formData.berat || "");
        payload.append("price", formData.harga);
        payload.append("discount", formData.diskon || "");
        payload.append("discountStartDate", formData.periodeDiskonMulai || "");
        payload.append("discountEndDate", formData.periodeDiskonSelesai || "");
        payload.append("stock", String(stockAsNumber));
        payload.append("isActive", "true");

        for (const file of imageFiles) {
            payload.append("images", file);
        }

        const response = await fetch("/api/products", {
            method: "POST",
            body: payload,
        });

        if (!response.ok) {
            throw new Error("Gagal menambahkan produk");
        }
    };

    return (
        <main>
            <StatusAlert
                isOpen={Boolean(submitAlert)}
                type={submitAlert?.type ?? "success"}
                title={submitAlert?.title ?? ""}
                message={submitAlert?.message ?? ""}
            />

            <div className="flex flex-col p-6 gap-6">
                <div className="flex flex-col">
                    <p className="text-xl font-bold">Manajemen Produk</p>
                    <p className="text-lg font-medium">Kelola produk qurban yang tersedia.</p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="w-full lg:max-w-115">
                        <SearchBar value={search} onChange={setSearch} />
                    </div>

                    <div className="w-fit">
                        <Button onClick={() => setIsTambahModalOpen(true)}>Tambah Produk</Button>
                    </div>
                </div>

                <ProductTable searchQuery={search} refreshKey={productTableRefreshKey} />
            </div>

            <TambahProdukModal
                isOpen={isTambahModalOpen}
                onClose={() => setIsTambahModalOpen(false)}
                onSubmitProduct={handleCreateProduct}
                onSubmitResult={handleSubmitResult}
            />
        </main>
    );
}