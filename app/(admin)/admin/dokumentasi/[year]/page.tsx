"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationPopup from "@/components/ui/ConfirmationPopup";
import DocumentationAlert from "@/components/ui/DocumentationAlert";

type Params = {
    params: Promise<{ year: string }>;
};

type YearDetailResponse = {
    data: {
        year: number;
        totalTransactions: number;
        latestVideo: {
            mediaUrl: string;
            fileName: string | null;
            uploadedAt: string;
        } | null;
    };
};

export default function DokumentasiTahunPage({ params }: Params) {
    const router = useRouter();
    const [resolvedYear, setResolvedYear] = useState("2026");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [selectedVideoPreviewUrl, setSelectedVideoPreviewUrl] = useState<string | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [isLoadingDetail, setIsLoadingDetail] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [removeVideoRequested, setRemoveVideoRequested] = useState(false);
    const [alertState, setAlertState] = useState<{
        variant: "success" | "warning" | "error";
        title: string;
        message: string;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        void params.then((resolved) => {
            setResolvedYear(resolved.year);
        });
    }, [params]);

    useEffect(() => {
        if (!videoFile) {
            setSelectedVideoPreviewUrl(null);
            return;
        }

        const nextUrl = URL.createObjectURL(videoFile);
        setSelectedVideoPreviewUrl(nextUrl);

        return () => {
            URL.revokeObjectURL(nextUrl);
        };
    }, [videoFile]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchYearDetail = async () => {
            setIsLoadingDetail(true);
            setPageError(null);

            try {
                const response = await fetch(`/api/transactions/documentations/${resolvedYear}`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Gagal mengambil detail dokumentasi distribusi.");
                }

                const result = (await response.json()) as YearDetailResponse;
                setTotalTransactions(result.data.totalTransactions);
                setVideoPreviewUrl(result.data.latestVideo?.mediaUrl ?? null);
            } catch (error) {
                if ((error as Error).name === "AbortError") {
                    return;
                }

                setPageError("Detail dokumentasi distribusi gagal dimuat.");
                setTotalTransactions(0);
                setVideoPreviewUrl(null);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingDetail(false);
                }
            }
        };

        if (resolvedYear) {
            void fetchYearDetail();
        }

        return () => controller.abort();
    }, [resolvedYear]);

    useEffect(() => {
        if (!alertState) {
            return;
        }

        const timer = window.setTimeout(() => {
            setAlertState(null);
        }, 4000);

        return () => window.clearTimeout(timer);
    }, [alertState]);

    const toDataUrl = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result ?? ""));
            reader.onerror = () => reject(new Error(`Gagal membaca file ${file.name}`));
            reader.readAsDataURL(file);
        });

    const handleSubmit = async () => {
        if (!videoFile && !removeVideoRequested) {
            setAlertState({
                variant: "warning",
                title: "Tidak ada video yang diunggah",
                message: "Silakan unggah minimal 1 video untuk dibagikan.",
            });
            return;
        }

        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        if (!videoFile && !removeVideoRequested) {
            return;
        }

        setIsSaving(true);

        try {
            const file = videoFile;
            const dataUrl = file ? await toDataUrl(file) : "";

            const response = await fetch("/api/transactions/documentations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    distributionYear: Number.parseInt(resolvedYear, 10),
                    removeVideo: removeVideoRequested,
                    ...(file
                        ? {
                            videoItem: {
                                fileName: file.name,
                                dataUrl,
                            },
                        }
                        : {}),
                }),
            });

            const result = (await response.json()) as { message?: string };

            if (!response.ok) {
                throw new Error(result.message ?? "Dokumentasi pendistribusian gagal diunggah.");
            }

            setAlertState({
                variant: "success",
                title: "Berhasil!",
                message: removeVideoRequested
                    ? `Dokumentasi pendistribusian qurban ${resolvedYear} berhasil dihapus.`
                    : `Dokumentasi pendistribusian qurban ${resolvedYear} berhasil diunggah.`,
            });
            setVideoFile(null);
            setVideoPreviewUrl(removeVideoRequested ? null : dataUrl);
            setRemoveVideoRequested(false);
        } catch (error) {
            setAlertState({
                variant: "error",
                title: "Terjadi Kesalahan.",
                message:
                    error instanceof Error
                        ? error.message
                        : "Dokumentasi pendistribusian gagal diunggah.",
            });
        } finally {
            setIsSaving(false);
            setShowConfirm(false);
        }
    };

    const handleCancel = () => {
        if (isSaving) {
            return;
        }

        setShowConfirm(false);
        setVideoFile(null);
        setSelectedVideoPreviewUrl(null);
        setAlertState(null);
        setRemoveVideoRequested(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        router.push("/admin/dokumentasi");
    };

    const handleRemoveVideo = () => {
        setVideoFile(null);
        setSelectedVideoPreviewUrl(null);
        setVideoPreviewUrl(null);
        setRemoveVideoRequested(true);
        setAlertState(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <main className="p-6">
            <Link href="/admin/dokumentasi" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A4C57] hover:opacity-80">
                <span aria-hidden="true">←</span>
                <span>Kembali</span>
            </Link>

            <div className="mt-4">
                <p className="text-xl font-bold text-neutral-900">Tahun : {resolvedYear}</p>
                <p className="mt-1 text-lg font-semibold text-neutral-800">Jumlah transaksi terkait: {totalTransactions}</p>
                {pageError && <p className="mt-2 text-sm text-red-400">{pageError}</p>}
            </div>

            <section className="mt-4 rounded-xl border border-neutral-200 bg-white p-5">
                <p className="text-xl font-bold text-neutral-900">Dokumentasi Pendistribusian</p>
                <p className="mt-1 text-lg text-neutral-800">Dokumentasi ini akan dikirim ke semua transaksi customer pada periode qurban yang sama</p>

                <label className="mt-4 flex h-80 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-400 bg-[#FAFAFA] text-center">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(event) => {
                            const selected = event.target.files?.[0] ?? null;
                            setVideoFile(selected);
                            setRemoveVideoRequested(false);
                            setAlertState(null);
                        }}
                    />

                    {selectedVideoPreviewUrl ? (
                        <video src={selectedVideoPreviewUrl} controls className="h-full w-full rounded-xl object-cover" />
                    ) : videoPreviewUrl ? (
                        <video src={videoPreviewUrl} controls className="h-full w-full rounded-xl object-cover" />
                    ) : (
                        <>
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-neutral-700">
                                <path d="M15 10 21 7v10l-6-3v-4Z" />
                                <rect x="3" y="6" width="12" height="12" rx="2" />
                            </svg>
                            <p className="mt-4 text-sm text-neutral-800">Unggah video dokumentasi pendistribusian</p>
                        </>
                    )}
                    {videoFile && <p className="mt-2 text-xs font-semibold text-[#0A6C75]">{videoFile.name}</p>}
                </label>

                {(selectedVideoPreviewUrl || videoPreviewUrl) && (
                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-10 rounded-xl border border-[#045A63] px-4 text-sm font-semibold text-[#045A63] hover:bg-[#E6F2F3]"
                        >
                            Ganti Video
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="h-10 rounded-xl border border-red-300 px-4 text-sm font-semibold text-red-500 hover:bg-red-50"
                        >
                            Hapus Video
                        </button>
                    </div>
                )}
            </section>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="h-12 cursor-pointer rounded-xl bg-neutral-300 text-base font-semibold text-white hover:bg-neutral-400 disabled:cursor-not-allowed disabled:hover:bg-neutral-300 disabled:opacity-80"
                >
                    Batal
                </button>
                <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={isSaving || isLoadingDetail}
                    className="h-12 rounded-xl bg-[#045A63] text-base font-semibold text-white hover:bg-[#034B52] disabled:cursor-not-allowed disabled:opacity-80"
                >
                    {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
            </div>

            <ConfirmationPopup
                isOpen={showConfirm}
                title="Konfirmasi"
                message="Apakah Anda yakin ingin menyimpan produk ini?"
                confirmLabel="Ya, Simpan"
                cancelLabel="Batal"
                isLoading={isSaving}
                onCancel={() => setShowConfirm(false)}
                onConfirm={() => void handleConfirm()}
            />

            <ConfirmationPopup
                isOpen={showDeleteConfirm}
                title="Konfirmasi Hapus Video"
                message="Apakah Anda yakin ingin menghapus video dokumentasi pendistribusian ini?"
                confirmLabel="Ya, Hapus"
                cancelLabel="Batal"
                isLoading={isSaving}
                onCancel={() => setShowDeleteConfirm(false)}
                onConfirm={() => {
                    setShowDeleteConfirm(false);
                    handleRemoveVideo();
                }}
            />

            {alertState && (
                <DocumentationAlert
                    variant={alertState.variant}
                    title={alertState.title}
                    message={alertState.message}
                    onClose={() => setAlertState(null)}
                />
            )}
        </main>
    );
}
