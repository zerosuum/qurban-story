"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SearchBar from "@/components/ui/SearchBar";
import DocumentationAlert from "@/components/ui/DocumentationAlert";
import DocumentationDistributionTable, {
    DistributionYearRow,
} from "@/components/ui/DocumentationDistributionTable";

const PAGE_SIZE = 25;

type DocumentationYearsResponse = {
    data: DistributionYearRow[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

export default function DokumentasiPage() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState<DistributionYearRow[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [alertState, setAlertState] = useState<{
        variant: "success" | "warning" | "error";
        title: string;
        message: string;
    } | null>(null);
    const folderInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!folderInputRef.current) {
            return;
        }

        folderInputRef.current.setAttribute("webkitdirectory", "");
        folderInputRef.current.setAttribute("directory", "");
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const fetchYears = async () => {
            setIsLoading(true);
            setFetchError(null);

            try {
                const query = new URLSearchParams({
                    page: String(page),
                    pageSize: String(PAGE_SIZE),
                });

                if (search.trim()) {
                    query.set("search", search.trim());
                }

                const response = await fetch(`/api/transactions/documentations?${query.toString()}`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Gagal mengambil data dokumentasi distribusi.");
                }

                const result = (await response.json()) as DocumentationYearsResponse;
                setRows(result.data);
                setTotalPages(Math.max(1, result.pagination.totalPages));
            } catch (error) {
                if ((error as Error).name === "AbortError") {
                    return;
                }

                setRows([]);
                setTotalPages(1);
                setFetchError("Data dokumentasi distribusi gagal dimuat.");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchYears();

        return () => controller.abort();
    }, [page, search]);

    useEffect(() => {
        setPage(1);
    }, [search]);

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

    const handleUploadSlaughterFolders = async (files: File[]) => {
        if (files.length === 0) {
            return;
        }

        setIsUploading(true);
        setAlertState(null);

        try {
            const photoItems = await Promise.all(
                files.map(async (file) => {
                    const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath ?? file.name;
                    const parts = relativePath.split(/[\\/]/).filter(Boolean);
                    const folderName = parts.length >= 2 ? parts[parts.length - 2] : "Tanpa Folder";

                    return {
                        folderName,
                        fileName: file.name,
                        dataUrl: await toDataUrl(file),
                    };
                }),
            );

            const response = await fetch("/api/transactions/documentations?action=slaughter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ photoItems }),
            });

            const result = (await response.json()) as { message?: string; data?: { matchedFolderCount: number } };

            if (!response.ok) {
                throw new Error(result.message ?? "Upload dokumentasi penyembelihan gagal.");
            }

            setAlertState({
                variant: "success",
                title: "Berhasil!",
                message: `${result.data?.matchedFolderCount ?? 0} folder berhasil dipetakan ke data pequrban.`,
            });
        } catch (error) {
            setAlertState({
                variant: "error",
                title: "Terjadi Kesalahan.",
                message:
                    error instanceof Error
                        ? error.message
                        : "Upload dokumentasi penyembelihan gagal.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const yearRows = useMemo(() => rows, [rows]);

    return (
        <main className="p-6">
            <div className="flex flex-col gap-8">
                <section className="rounded-xl border border-neutral-200 bg-white p-5">
                    <p className="text-[32px] font-bold text-neutral-900">Dokumentasi Penyembelihan</p>
                    <p className="mt-1 text-lg text-neutral-800">
                        Upload folder foto penyembelihan. Nama folder harus sesuai dengan nama pequrban agar dapat dipetakan otomatis.
                    </p>

                    <div className="mt-5 rounded-xl border border-[#5AA4DA] bg-[#DFEEF9] p-4 text-[#0E6CA8]">
                        <p className="font-bold">Cara kerja upload folder:</p>
                        <ol className="mt-2 list-decimal pl-5 text-sm leading-6">
                            <li>Siapkan folder dengan nama sesuai nama pequrban</li>
                            <li>Jika nama pequrban sama, tambahkan kode invoice berawalan ORD pada nama folder (contoh: "Ahmad ORD-AB12CD34")</li>
                            <li>Masukkan foto dokumentasi ke dalam masing-masing folder</li>
                            <li>Upload semua folder sekaligus melalui area di bawah</li>
                            <li>Sistem akan otomatis mencocokkan nama folder dengan data pequrban</li>
                        </ol>
                    </div>

                    <label className="mt-5 flex h-41 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-400 bg-[#FAFAFA] text-center">
                        <input
                            ref={folderInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                                const files = Array.from(event.target.files ?? []);
                                setUploadedFiles(files);
                                void handleUploadSlaughterFolders(files);
                            }}
                        />

                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="text-neutral-700">
                            <path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
                            <path d="M3 7a2 2 0 0 1 2-2h4" />
                        </svg>
                        <p className="mt-4 text-sm text-neutral-800">Anda dapat mengunggah folder yang berisi foto dokumentasi penyembelihan</p>
                        <p className="text-xs text-neutral-500">(maks. 5 MB per file)</p>
                        {uploadedFiles.length > 0 && (
                            <p className="mt-2 text-xs font-semibold text-[#0A6C75]">{uploadedFiles.length} file siap diproses</p>
                        )}
                        {isUploading && <p className="mt-2 text-xs font-semibold text-[#0A6C75]">Mengunggah dokumentasi...</p>}
                    </label>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-white p-5">
                    <p className="text-[32px] font-bold text-neutral-900">Dokumentasi Distribusi</p>
                    <p className="mt-1 text-lg text-neutral-800">Kelola dokumentasi distribusi yang digunakan untuk semua transaksi</p>

                    <div className="mt-4 w-full max-w-100">
                        <SearchBar value={search} onChange={setSearch} placeholder="Pencarian..." />
                    </div>

                    <div className="mt-4">
                        {isLoading ? (
                            <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-neutral-500">
                                Memuat data dokumentasi distribusi...
                            </div>
                        ) : fetchError ? (
                            <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-red-400">
                                {fetchError}
                            </div>
                        ) : (
                            <DocumentationDistributionTable
                                rows={yearRows}
                                page={page}
                                totalPages={totalPages}
                                onPrevPage={() => setPage((prev) => Math.max(1, prev - 1))}
                                onNextPage={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            />
                        )}
                    </div>
                </section>
            </div>

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
