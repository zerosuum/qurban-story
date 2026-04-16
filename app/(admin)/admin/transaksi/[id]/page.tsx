"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import StatusPembayaranBadge from "@/components/ui/StatusPembayaranBadge";
import StatusPelaporanBadge from "@/components/ui/StatusPelaporanBadge";

type DetailResponse = {
    data: {
        id: string;
        invoice: string;
        customer: string;
        produk: string;
        tanggal: string;
        nominal: string;
        pembayaran: "BERHASIL" | "GAGAL" | "KADALUARSA" | "TERTUNDA";
        pelaporan: "Tahap 1/3" | "Tahap 2/3" | "Selesai" | "Belum Dimulai";
        documentation: {
            photoUrls: string[];
            videoUrl: string | null;
        };
    };
};

function formatRupiah(value: string) {
    const number = Number(value);
    if (Number.isNaN(number)) return value;
    return new Intl.NumberFormat("id-ID").format(number);
}

function ImagePlaceholderIcon() {
    return (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <path
                d="M4 36C2.9 36 1.95833 35.6083 1.175 34.825C0.391667 34.0417 0 33.1 0 32V4C0 2.9 0.391667 1.95833 1.175 1.175C1.95833 0.391667 2.9 0 4 0H32C33.1 0 34.0417 0.391667 34.825 1.175C35.6083 1.95833 36 2.9 36 4V32C36 33.1 35.6083 34.0417 34.825 34.825C34.0417 35.6083 33.1 36 32 36H4ZM4 32H32V4H4V32ZM6 28H30L22.5 18L16.5 26L12 20L6 28Z"
                fill="#1C1B1F"
            />
        </svg>
    );
}

function VideoPlaceholderIcon() {
    return (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <path
                d="M10 8H22C23.1046 8 24 8.89543 24 10V14L30 10V26L24 22V26C24 27.1046 23.1046 28 22 28H10C8.89543 28 8 27.1046 8 26V10C8 8.89543 8.89543 8 10 8Z"
                fill="#1C1B1F"
            />
        </svg>
    );
}

export default function DetailTransaksiPage({ params }: { params: Promise<{ id: string }> }) {
    const [detail, setDetail] = useState<DetailResponse["data"] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [tahap2Date, setTahap2Date] = useState("");
    const [tahap3Date, setTahap3Date] = useState("");
    const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
    const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
    const [slaughterFiles, setSlaughterFiles] = useState<File[]>([]);
    const [distributionVideoFile, setDistributionVideoFile] = useState<File | null>(null);
    const [distributionReportFile, setDistributionReportFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const slaughterPreviews = useMemo(() => {
        return slaughterFiles.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
            isVideo: file.type.startsWith("video/"),
        }));
    }, [slaughterFiles]);

    const distributionVideoPreviewUrl = useMemo(() => {
        if (!distributionVideoFile) {
            return null;
        }

        return URL.createObjectURL(distributionVideoFile);
    }, [distributionVideoFile]);

    useEffect(() => {
        return () => {
            for (const item of slaughterPreviews) {
                URL.revokeObjectURL(item.previewUrl);
            }
        };
    }, [slaughterPreviews]);

    useEffect(() => {
        return () => {
            if (distributionVideoPreviewUrl) {
                URL.revokeObjectURL(distributionVideoPreviewUrl);
            }
        };
    }, [distributionVideoPreviewUrl]);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            const resolved = await params;
            if (!mounted) return;

            try {
                setIsLoading(true);
                setErrorMessage(null);

                const response = await fetch(`/api/transactions/${resolved.id}`);
                if (!response.ok) {
                    throw new Error("Detail transaksi tidak ditemukan.");
                }

                const result = (await response.json()) as DetailResponse;
                if (!mounted) return;
                setDetail(result.data);
                setExistingPhotoUrls(result.data.documentation.photoUrls ?? []);
                setExistingVideoUrl(result.data.documentation.videoUrl ?? null);
            } catch (error) {
                if (!mounted) return;
                setErrorMessage(error instanceof Error ? error.message : "Gagal memuat detail transaksi.");
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void load();

        return () => {
            mounted = false;
        };
    }, [params]);

    const actionButtonLabel = isEditMode ? "Simpan Perubahan" : "Perbarui Pelaporan";
    const animalCode = detail?.produk.toLowerCase().includes("kambing")
        ? "KMB-001"
        : detail?.produk.toLowerCase().includes("sapi")
            ? "SPI-001"
            : "PRD-001";

    const handleSlaughterFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);

        if (files.length === 0) {
            return;
        }

        setSlaughterFiles((prev) => {
            const existing = new Set(prev.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
            const next = [...prev];

            for (const file of files) {
                const key = `${file.name}-${file.size}-${file.lastModified}`;

                if (existing.has(key)) {
                    continue;
                }

                next.push(file);
                existing.add(key);
            }

            return next;
        });

        event.target.value = "";
    };

    const handleReplaceExistingPhoto = async (index: number, file: File | null) => {
        if (!file) {
            return;
        }

        try {
            const nextDataUrl = await fileToDataUrl(file);
            setExistingPhotoUrls((prev) => prev.map((url, i) => (i === index ? nextDataUrl : url)));
        } catch {
            setErrorMessage("Gagal mengganti foto dokumentasi.");
        }
    };

    const handleReplaceNewPhoto = (index: number, file: File | null) => {
        if (!file) {
            return;
        }

        setSlaughterFiles((prev) => prev.map((item, i) => (i === index ? file : item)));
    };

    const removeSlaughterFile = (index: number) => {
        if (index < existingPhotoUrls.length) {
            setExistingPhotoUrls((prev) => prev.filter((_, i) => i !== index));
            return;
        }

        const fileIndex = index - existingPhotoUrls.length;
        setSlaughterFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    };

    const handleDistributionVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setDistributionVideoFile(file);
        if (file) {
            setExistingVideoUrl(null);
        }
        event.target.value = "";
    };

    const handleRemoveVideo = () => {
        setDistributionVideoFile(null);
        setExistingVideoUrl(null);
    };

    const handleDistributionReportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setDistributionReportFile(file);
        event.target.value = "";
    };

    const fileToDataUrl = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result ?? ""));
            reader.onerror = () => reject(new Error(`Gagal membaca file ${file.name}`));
            reader.readAsDataURL(file);
        });

    const handleSaveChanges = async () => {
        if (!detail) {
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            if (tahap2Date || tahap3Date) {
                const reportingResponse = await fetch("/api/transactions", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        orderIds: [detail.id],
                        tahap2Date,
                        tahap3Date,
                    }),
                });

                const reportingResult = (await reportingResponse.json()) as { message?: string };

                if (!reportingResponse.ok) {
                    throw new Error(reportingResult.message ?? "Gagal menyimpan update pelaporan.");
                }
            }

            const newPhotoItems = await Promise.all(
                slaughterFiles
                    .filter((file) => file.type.startsWith("image/"))
                    .map(async (file) => ({
                        fileName: file.name,
                        dataUrl: await fileToDataUrl(file),
                    })),
            );

            const mergedPhotoItems = [
                ...existingPhotoUrls.map((url, index) => ({
                    fileName: `existing-${index + 1}.jpg`,
                    dataUrl: url,
                })),
                ...newPhotoItems,
            ];

            let mergedVideoItem: { fileName: string; dataUrl: string } | null = null;

            if (distributionVideoFile) {
                mergedVideoItem = {
                    fileName: distributionVideoFile.name,
                    dataUrl: await fileToDataUrl(distributionVideoFile),
                };
            } else if (existingVideoUrl) {
                mergedVideoItem = {
                    fileName: "existing-video.mp4",
                    dataUrl: existingVideoUrl,
                };
            }

            const documentationResponse = await fetch(`/api/transactions/${detail.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    photoItems: mergedPhotoItems,
                    videoItem: mergedVideoItem,
                }),
            });

            const documentationResult = (await documentationResponse.json()) as { message?: string };

            if (!documentationResponse.ok) {
                throw new Error(documentationResult.message ?? "Gagal memperbarui dokumentasi transaksi.");
            }

            setIsEditMode(false);
            setSlaughterFiles([]);
            setDistributionVideoFile(null);
            setDistributionReportFile(null);
            setTahap2Date("");
            setTahap3Date("");
            setSuccessMessage("Perubahan berhasil disimpan dan dokumentasi berhasil didistribusikan.");

            const refreshed = await fetch(`/api/transactions/${detail.id}`);
            if (refreshed.ok) {
                const refreshedResult = (await refreshed.json()) as DetailResponse;
                setDetail(refreshedResult.data);
                setExistingPhotoUrls(refreshedResult.data.documentation.photoUrls ?? []);
                setExistingVideoUrl(refreshedResult.data.documentation.videoUrl ?? null);
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Gagal menyimpan perubahan.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main>
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <Link href="/admin/transaksi" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:opacity-80">
                        <span aria-hidden="true">←</span>
                        <span>Kembali</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => {
                            if (isEditMode) {
                                void handleSaveChanges();
                                return;
                            }

                            setSuccessMessage(null);
                            setErrorMessage(null);
                            setExistingPhotoUrls(detail?.documentation.photoUrls ?? []);
                            setExistingVideoUrl(detail?.documentation.videoUrl ?? null);
                            setSlaughterFiles([]);
                            setDistributionVideoFile(null);
                            setIsEditMode(true);
                        }}
                        disabled={isSaving}
                        className="h-10 cursor-pointer rounded-xl bg-primary-500 px-6 text-sm font-semibold text-white hover:bg-primary-600"
                    >
                        {isSaving ? "Menyimpan..." : actionButtonLabel}
                    </button>
                </div>

                <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    {isLoading && <p className="text-neutral-500">Memuat detail transaksi...</p>}
                    {!isLoading && errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    {!isLoading && successMessage && <p className="text-green-600">{successMessage}</p>}

                    {!isLoading && detail && (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <p className="text-xl font-bold text-black">Detail Transaksi</p>
                                <p className="font-medium text-neutral-700">{detail.invoice}</p>
                                <p className="text-sm text-neutral-500">{detail.tanggal}, 10.30 WIB</p>
                            </div>

                            <div className="grid grid-cols-1 gap-y-4 gap-x-8 md:grid-cols-3">
                                <div>
                                    <p className="text-sm text-neutral-500">Nama Pequrban</p>
                                    <p className="font-semibold text-neutral-900">{detail.customer}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500">Kode Hewan</p>
                                    <p className="font-semibold text-neutral-900">{animalCode}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500">Metode Pembayaran</p>
                                    <p className="font-semibold text-neutral-900">BCA Virtual Account</p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500">Nama yang Berqurban</p>
                                    <p className="font-semibold text-neutral-900">{detail.customer}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500">Produk</p>
                                    <p className="font-semibold text-neutral-900">{detail.produk}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500">Harga</p>
                                    <p className="font-semibold text-neutral-900">Rp. {formatRupiah(detail.nominal)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-xl font-bold text-black">Progress Pelaporan</p>

                    <div className="mt-6 flex flex-col gap-6">
                        <div className="flex items-start gap-4">
                            <img src="/icons/progress-check.svg" alt="Tahap 1" className="h-8 w-8" />
                            <div>
                                <p className="text-2xl font-bold text-neutral-900">Tahap 1: Disembelih</p>
                                <p className="mt-1 text-sm text-neutral-700">Hewan qurban telah disembelih sesuai syariat Islam.</p>
                                <p className="mt-1 text-sm text-neutral-700">27 Mei 2025 08.30 WIB</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <img src="/icons/progress-clock.svg" alt="Tahap 2" className="h-8 w-8" />
                            <div>
                                <p className="text-2xl font-bold text-neutral-900">Tahap 2: Distribusi</p>
                                <p className="mt-1 text-sm text-neutral-700">Daging qurban sedang didistribusikan kepada penerima manfaat.</p>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={tahap2Date}
                                        onChange={(event) => setTahap2Date(event.target.value)}
                                        placeholder="dd/mm/yyyy"
                                        className="mt-2 h-10 w-35 rounded-xl border border-neutral-200 px-3 text-sm text-neutral-600 outline-none focus:border-primary-500"
                                    />
                                ) : (
                                    <p className="mt-1 text-sm text-neutral-700">-</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <img src="/icons/progress-cross.svg" alt="Tahap 3" className="h-8 w-8" />
                            <div>
                                <p className="text-2xl font-bold text-neutral-900">Tahap 3: Selesai</p>
                                <p className="mt-1 text-sm text-neutral-700">Proses qurban telah selesai.</p>
                                <p className="text-sm text-neutral-700">Terimakasih telah mempercayai Qurban Story.</p>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={tahap3Date}
                                        onChange={(event) => setTahap3Date(event.target.value)}
                                        placeholder="dd/mm/yyyy"
                                        className="mt-2 h-10 w-35 rounded-xl border border-neutral-200 px-3 text-sm text-neutral-600 outline-none focus:border-primary-500"
                                    />
                                ) : (
                                    <p className="mt-1 text-sm text-neutral-700">-</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-xl font-bold text-black">Dokumentasi</p>
                    <p className="mt-2 text-neutral-700">Foto &amp; video penyembelihan</p>

                    {isEditMode ? (
                        <>
                            <label className="mt-3 flex h-31 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-400 bg-neutral-50 text-center hover:border-neutral-500">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleSlaughterFilesChange}
                                    className="hidden"
                                />
                                <ImagePlaceholderIcon />
                                <p className="text-[11px] text-neutral-800">
                                    Upload foto dokumentasi untuk pelaporan transaksi yang sedang dipilih.
                                </p>
                            </label>

                            <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
                                {existingPhotoUrls.map((url, index) => (
                                    <div key={`existing-${index}`} className="relative h-31 overflow-hidden rounded-xl bg-neutral-100">
                                        <img
                                            src={url}
                                            alt={`Dokumentasi existing ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />

                                        <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                                            <label className="inline-flex cursor-pointer items-center rounded bg-black/70 px-2 py-1 text-[10px] text-white">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(event) => void handleReplaceExistingPhoto(index, event.target.files?.[0] ?? null)}
                                                />
                                                Ganti
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => removeSlaughterFile(index)}
                                                className="cursor-pointer rounded bg-black/70 px-2 py-1 text-[10px] text-white"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {slaughterPreviews.map((item, index) => {
                                    const absoluteIndex = existingPhotoUrls.length + index;

                                    return (
                                        <div key={`new-${index}`} className="relative h-31 overflow-hidden rounded-xl bg-neutral-100">
                                            <img
                                                src={item.previewUrl}
                                                alt={`Dokumentasi baru ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />

                                            <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                                                <label className="inline-flex cursor-pointer items-center rounded bg-black/70 px-2 py-1 text-[10px] text-white">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(event) => handleReplaceNewPhoto(index, event.target.files?.[0] ?? null)}
                                                    />
                                                    Ganti
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSlaughterFile(absoluteIndex)}
                                                    className="cursor-pointer rounded bg-black/70 px-2 py-1 text-[10px] text-white"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {existingPhotoUrls.length === 0 && slaughterPreviews.length === 0 && (
                                    <div className="col-span-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm text-neutral-500 lg:col-span-4">
                                        Belum ada foto dokumentasi.
                                    </div>
                                )}
                            </div>

                            <p className="mt-3 text-neutral-700">Video pendistribusian</p>
                            <label className="mt-2 flex h-77.5 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-neutral-100 text-neutral-500">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleDistributionVideoChange}
                                    className="hidden"
                                />

                                {distributionVideoPreviewUrl ? (
                                    <video
                                        src={distributionVideoPreviewUrl}
                                        controls
                                        className="h-full w-full object-cover"
                                    />
                                ) : existingVideoUrl ? (
                                    <video
                                        src={existingVideoUrl}
                                        controls
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <VideoPlaceholderIcon />
                                )}
                            </label>

                            {(distributionVideoPreviewUrl || existingVideoUrl) && (
                                <button
                                    type="button"
                                    onClick={handleRemoveVideo}
                                    className="mt-2 h-10 rounded-xl border border-red-300 px-4 text-sm font-semibold text-red-500 hover:bg-red-50"
                                >
                                    Hapus Video
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
                                {[0, 1, 2, 3].map((index) => {
                                    const photoUrl = detail?.documentation.photoUrls?.[index] ?? null;
                                    const placeholderIsVideo = index === 2;

                                    return (
                                        <div key={index} className="relative h-31 overflow-hidden rounded-xl bg-neutral-100">
                                            {photoUrl ? (
                                                <img
                                                    src={photoUrl}
                                                    alt={`Dokumentasi ${index + 1}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    {placeholderIsVideo ? <VideoPlaceholderIcon /> : <ImagePlaceholderIcon />}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="mt-3 text-neutral-700">Video pendistribusian</p>
                            <div className="mt-2 flex h-77.5 items-center justify-center overflow-hidden rounded-xl bg-neutral-100 text-neutral-500">
                                {detail?.documentation.videoUrl ? (
                                    <video
                                        src={detail.documentation.videoUrl}
                                        controls
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <VideoPlaceholderIcon />
                                )}
                            </div>
                        </>
                    )}
                </section>

                <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-xl font-bold text-black">Laporan Distribusi</p>

                    {isEditMode ? (
                        <label className="mt-3 flex h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-neutral-300 text-xs text-neutral-500 hover:border-primary-300">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleDistributionReportChange}
                                className="hidden"
                            />
                            {distributionReportFile ? distributionReportFile.name : "Unggah laporan distribusi"}
                        </label>
                    ) : (
                        <div className="mt-3 rounded-md bg-[#FFF4E5] px-4 py-3 text-sm text-neutral-600">
                            {distributionReportFile ? `Laporan: ${distributionReportFile.name}` : "Laporan distribusi belum diunggah."}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
