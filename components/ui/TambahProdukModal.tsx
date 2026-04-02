"use client";

import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import ConfirmationPopup from "./ConfirmationPopup";
import DateRangePicker from "./DateRangePicker";

type TambahProdukForm = {
    namaProduk: string;
    tipe: string;
    berat: string;
    stok: string;
    harga: string;
    diskon: string;
    periodeDiskonMulai: string;
    periodeDiskonSelesai: string;
    deskripsi: string;
};

export type { TambahProdukForm };

type TambahProdukModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmitProduct?: (formData: TambahProdukForm, imageFiles: File[]) => Promise<void> | void;
    onSubmitResult?: (status: "success" | "error") => void;
};

const initialForm: TambahProdukForm = {
    namaProduk: "",
    tipe: "Full",
    berat: "",
    stok: "",
    harga: "",
    diskon: "",
    periodeDiskonMulai: "",
    periodeDiskonSelesai: "",
    deskripsi: "",
};

type SelectedImage = {
    file: File;
    previewUrl: string;
};

function formatRupiahInput(value: string) {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
        return "";
    }

    return `Rp ${new Intl.NumberFormat("id-ID").format(Number(digits))}`;
}

function formatDiscountPercentInput(value: string) {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
        return "";
    }

    const clampedValue = Math.min(100, Number(digits));
    return `${clampedValue}%`;
}

export default function TambahProdukModal({
    isOpen,
    onClose,
    onSubmitProduct,
    onSubmitResult,
}: TambahProdukModalProps) {
    const [form, setForm] = useState<TambahProdukForm>(initialForm);
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const previewUrlRegistryRef = useRef<Set<string>>(new Set());

    const handleFieldChange = (field: keyof TambahProdukForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);

        if (files.length === 0) {
            return;
        }

        setSelectedImages((prev) => {
            const existingFileKey = new Set(
                prev.map((item) => `${item.file.name}-${item.file.size}-${item.file.lastModified}`)
            );
            const next = [...prev];

            for (const file of files) {
                const fileKey = `${file.name}-${file.size}-${file.lastModified}`;

                if (existingFileKey.has(fileKey)) {
                    continue;
                }

                const previewUrl = URL.createObjectURL(file);
                previewUrlRegistryRef.current.add(previewUrl);
                next.push({ file, previewUrl });
                existingFileKey.add(fileKey);
            }

            return next;
        });

        event.target.value = "";
    };

    const revokeAllPreviewUrls = () => {
        for (const url of previewUrlRegistryRef.current) {
            URL.revokeObjectURL(url);
        }

        previewUrlRegistryRef.current.clear();
    };

    const removeSelectedImage = (index: number) => {
        setSelectedImages((prev) => {
            const selected = prev[index];

            if (selected) {
                URL.revokeObjectURL(selected.previewUrl);
                previewUrlRegistryRef.current.delete(selected.previewUrl);
            }

            return prev.filter((_, imageIndex) => imageIndex !== index);
        });
    };

    useEffect(() => {
        return () => {
            revokeAllPreviewUrls();
        };
    }, []);

    const handleCancel = () => {
        setForm(initialForm);
        setSelectedImages([]);
        revokeAllPreviewUrls();
        setIsConfirmOpen(false);
        setIsSubmitting(false);
        onClose();
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsConfirmOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);

        try {
            if (onSubmitProduct) {
                await onSubmitProduct(
                    form,
                    selectedImages.map((item) => item.file)
                );
            }

            onSubmitResult?.("success");
            handleCancel();
        } catch {
            onSubmitResult?.("error");
            setIsConfirmOpen(false);
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {!isConfirmOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-800/50 p-4 backdrop-blur-sm">
                    <div className="relative h-[896px] w-[600px] max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-neutral-100 bg-white p-6 shadow-[0_8px_28px_-6px_rgba(24,39,75,0.12),0_18px_88px_-4px_rgba(24,39,75,0.14)] [scrollbar-width:thin] [scrollbar-color:#044B57_#F3F3F3] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-neutral-50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary-100 [&::-webkit-scrollbar-thumb:hover]:bg-primary-300">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="absolute top-5 right-5 cursor-pointer text-xl leading-none text-neutral-400 hover:text-neutral-500"
                            aria-label="Tutup modal"
                        >
                            ×
                        </button>

                        <h4 className="mb-4 text-2xl font-bold text-black">Tambah Produk</h4>

                        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                            <label className="block cursor-pointer overflow-hidden rounded-xl border border-dashed border-neutral-200 bg-neutral-50">
                                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />

                                <div className="flex h-36 flex-col items-center justify-center gap-2 text-neutral-400">
                                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M3 4h18v16H3z" />
                                        <path d="m7 15 3-3 3 3 3-4 3 4" />
                                        <circle cx="9" cy="8" r="1" />
                                    </svg>
                                    <span className="text-sm font-medium text-neutral-500">Unggah foto produk (bisa lebih dari satu)</span>
                                    <span className="text-xs text-neutral-400">{selectedImages.length} foto dipilih</span>
                                </div>
                            </label>

                            {selectedImages.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                    {selectedImages.map((item, index) => (
                                        <div key={`${item.file.name}-${item.file.lastModified}`} className="relative overflow-hidden rounded-xl border border-neutral-100">
                                            <img src={item.previewUrl} alt={`Preview produk ${index + 1}`} className="h-28 w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeSelectedImage(index)}
                                                className="absolute right-2 top-2 cursor-pointer rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label htmlFor="namaProduk" className="text-base font-semibold text-neutral-500">
                                    Nama Produk <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="namaProduk"
                                    value={form.namaProduk}
                                    onChange={(event) => handleFieldChange("namaProduk", event.target.value)}
                                    placeholder="Kambing Premium"
                                    className="h-10 w-full rounded-xl border border-neutral-100 px-3 text-sm text-neutral-500 outline-none focus:border-primary-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="tipe" className="text-base font-semibold text-neutral-500">
                                        Tipe <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="tipe"
                                        value={form.tipe}
                                        onChange={(event) => handleFieldChange("tipe", event.target.value)}
                                        className="h-10 w-full rounded-xl border border-neutral-100 px-3 text-sm text-neutral-500 outline-none focus:border-primary-500"
                                        required
                                    >
                                        <option value="Full">Full</option>
                                        <option value="Patungan (1/7)">Patungan (1/7)</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="berat" className="text-base font-semibold text-neutral-500">
                                        Berat <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="berat"
                                        value={form.berat}
                                        onChange={(event) => handleFieldChange("berat", event.target.value)}
                                        placeholder="30 KG"
                                        className="h-10 w-full rounded-xl border border-neutral-100 px-3 text-sm text-neutral-500 outline-none focus:border-primary-500"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="stok" className="text-base font-semibold text-neutral-500">
                                        Stok <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="stok"
                                        value={form.stok}
                                        onChange={(event) => handleFieldChange("stok", event.target.value)}
                                        placeholder="12"
                                        className="h-10 w-full rounded-xl border border-neutral-100 px-3 text-sm text-neutral-500 outline-none focus:border-primary-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="harga" className="text-base font-semibold text-neutral-500">
                                        Harga (Rp) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="harga"
                                        value={form.harga}
                                        onChange={(event) => handleFieldChange("harga", formatRupiahInput(event.target.value))}
                                        placeholder="Rp. 3.600.000"
                                        className="h-10 w-full rounded-xl border border-neutral-100 px-3 text-sm text-neutral-500 outline-none focus:border-primary-500"
                                        inputMode="numeric"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="diskon" className="text-base font-semibold text-neutral-500">
                                        Diskon
                                    </label>
                                    <input
                                        id="diskon"
                                        value={form.diskon}
                                        onChange={(event) => handleFieldChange("diskon", formatDiscountPercentInput(event.target.value))}
                                        placeholder="10%"
                                        className="h-10 w-full rounded-xl border border-neutral-100 px-3 text-sm text-neutral-500 outline-none focus:border-primary-500"
                                        inputMode="numeric"
                                    />
                                </div>

                                <DateRangePicker
                                    label="Periode Diskon"
                                    startDate={form.periodeDiskonMulai}
                                    endDate={form.periodeDiskonSelesai}
                                    placeholder="Pilih periode diskon"
                                    onChange={(nextStartDate, nextEndDate) => {
                                        handleFieldChange("periodeDiskonMulai", nextStartDate);
                                        handleFieldChange("periodeDiskonSelesai", nextEndDate);
                                    }}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="deskripsi" className="text-base font-semibold text-neutral-500">
                                    Deskripsi
                                </label>
                                <textarea
                                    id="deskripsi"
                                    value={form.deskripsi}
                                    onChange={(event) => handleFieldChange("deskripsi", event.target.value)}
                                    placeholder="Masukkan Deskripsi"
                                    rows={4}
                                    className="w-full resize-none rounded-xl border border-neutral-100 px-3 py-3 text-sm text-neutral-500 outline-none focus:border-primary-500"
                                />
                            </div>

                            <div className="mt-1 flex justify-end gap-3">
                                <Button
                                    variant="secondary"
                                    className="border border-primary-500 bg-white text-primary-500 hover:bg-neutral-50"
                                    onClick={handleCancel}
                                    type="button"
                                >
                                    Batal
                                </Button>
                                <Button type="submit">Tambah</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationPopup
                isOpen={isConfirmOpen}
                title="Konfirmasi"
                message="Apakah Anda yakin ingin menyimpan produk ini?"
                confirmLabel="Ya, Simpan"
                cancelLabel="Batal"
                isLoading={isSubmitting}
                onCancel={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmSubmit}
            />
        </>
    );
}
