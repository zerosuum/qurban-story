"use client";

import type { TambahProdukForm } from "./TambahProdukModal";
import Button from "./Button";

type DetailProdukModalProps = {
    isOpen: boolean;
    onClose: () => void;
    product: TambahProdukForm;
    imageUrls?: string[];
};

export default function DetailProdukModal({
    isOpen,
    onClose,
    product,
    imageUrls = [],
}: DetailProdukModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-800/50 p-4 backdrop-blur-sm">
            <div className="relative h-[896px] w-[600px] max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-neutral-100 bg-white p-6 shadow-[0_8px_28px_-6px_rgba(24,39,75,0.12),0_18px_88px_-4px_rgba(24,39,75,0.14)] [scrollbar-width:thin] [scrollbar-color:#044B57_#F3F3F3] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-neutral-50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary-100 [&::-webkit-scrollbar-thumb:hover]:bg-primary-300">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-5 top-5 cursor-pointer text-xl leading-none text-neutral-400 hover:text-neutral-500"
                    aria-label="Tutup modal"
                >
                    ×
                </button>

                <h4 className="mb-4 text-2xl font-bold text-black">Detail Produk</h4>

                <div className="flex flex-col gap-4">
                    <div className="overflow-hidden rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-3">
                        {imageUrls.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                {imageUrls.map((url, index) => (
                                    <img
                                        key={`${url}-${index}`}
                                        src={url}
                                        alt={`Foto produk ${index + 1}`}
                                        className="h-28 w-full rounded-xl border border-neutral-100 object-cover"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-28 items-center justify-center text-sm text-neutral-400">Belum ada foto produk.</div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-base font-semibold text-neutral-500">Nama Produk</label>
                        <input value={product.namaProduk} readOnly className="h-10 w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3 text-sm text-neutral-500" />
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-semibold text-neutral-500">Tipe</label>
                            <input value={product.tipe} readOnly className="h-10 w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3 text-sm text-neutral-500" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-semibold text-neutral-500">Berat</label>
                            <input value={product.berat} readOnly className="h-10 w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3 text-sm text-neutral-500" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-semibold text-neutral-500">Stok</label>
                            <input value={product.stok} readOnly className="h-10 w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3 text-sm text-neutral-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-semibold text-neutral-500">Harga (Rp)</label>
                            <input value={product.harga} readOnly className="h-10 w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3 text-sm text-neutral-500" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-semibold text-neutral-500">Diskon</label>
                            <input value={product.diskon} readOnly className="h-10 w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3 text-sm text-neutral-500" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-semibold text-neutral-500">Periode Diskon</label>
                            <input
                                value={product.periodeDiskonMulai ? `${product.periodeDiskonMulai}${product.periodeDiskonSelesai ? ` - ${product.periodeDiskonSelesai}` : ""}` : "-"}
                                readOnly
                                className="h-10 w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3 text-sm text-neutral-500"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-base font-semibold text-neutral-500">Deskripsi</label>
                        <textarea
                            value={product.deskripsi}
                            readOnly
                            rows={4}
                            className="w-full resize-none rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-3 text-sm text-neutral-500"
                        />
                    </div>

                    <div className="mt-1 flex justify-end">
                        <Button type="button" onClick={onClose}>Tutup</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
