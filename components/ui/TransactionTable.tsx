"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FilterPelaporan from "./FilterPelaporan";
import FilterPembayaran from "./FilterPembayaran";
import SearchBar from "./SearchBar";
import StatusPelaporanBadge from "./StatusPelaporanBadge";
import StatusPembayaranBadge from "./StatusPembayaranBadge";
import ConfirmationPopup from "./ConfirmationPopup";
import UpdatePelaporanModal from "./UpdatePelaporanModal";

type PaymentStatus = "BERHASIL" | "GAGAL" | "KADALUARSA" | "TERTUNDA";
type ReportingStatus = "Tahap 1/3" | "Tahap 2/3" | "Selesai" | "Belum Dimulai";

type TransactionRow = {
    id: string;
    invoice: string;
    customer: string;
    produk: string;
    tanggal: string;
    nominal: string;
    pembayaran: PaymentStatus;
    pelaporan: ReportingStatus;
};

type TransactionSummary = {
    total: number;
    berhasil: number;
    tertunda: number;
    gagal: number;
};

type TransactionsApiResponse = {
    data: TransactionRow[];
    summary: TransactionSummary;
    isFallbackData?: boolean;
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

type TransactionDetailApiResponse = {
    data?: {
        reportingDates?: {
            tahap1Date?: string | null;
            tahap2Date?: string | null;
            tahap3Date?: string | null;
        };
    };
};

type TransactionTableProps = {
    onSummaryChange?: (summary: TransactionSummary) => void;
    mode?: "dashboard" | "transaksi";
};

const PAGE_SIZE = 25;

function formatRupiah(value: string) {
    const number = Number(value);
    if (Number.isNaN(number)) return value;
    return new Intl.NumberFormat("id-ID").format(number);
}

export default function TransactionTable({ onSummaryChange, mode = "dashboard" }: TransactionTableProps) {
    const [rows, setRows] = useState<TransactionRow[]>([]);
    const [search, setSearch] = useState("");
    const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "Semua Pembayaran">("Semua Pembayaran");
    const [reportFilter, setReportFilter] = useState<ReportingStatus | "Semua Pelaporan">("Semua Pelaporan");
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showSelectionWarning, setShowSelectionWarning] = useState(false);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
    const [tahap1Date, setTahap1Date] = useState("");
    const [tahap2Date, setTahap2Date] = useState("");
    const [tahap3Date, setTahap3Date] = useState("");
    const [isPrefillingReport, setIsPrefillingReport] = useState(false);
    const [sequenceWarning, setSequenceWarning] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isAllPagesSelected, setIsAllPagesSelected] = useState(false);

    const isTransaksiMode = mode === "transaksi";
    const selectedCount = isAllPagesSelected ? totalItems : selectedIds.length;
    const allSelected = isAllPagesSelected || (rows.length > 0 && rows.every((row) => selectedIds.includes(row.id)));
    const colSpan = isTransaksiMode ? 8 : 8;

    const goPrev = () => setPage((prev) => Math.max(1, prev - 1));
    const goNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

    useEffect(() => {
        setPage(1);
    }, [search, paymentFilter, reportFilter]);

    useEffect(() => {
        if (isAllPagesSelected) {
            return;
        }

        setSelectedIds((prev) => prev.filter((id) => rows.some((row) => row.id === id)));
    }, [rows, isAllPagesSelected]);

    useEffect(() => {
        setSelectedIds([]);
        setIsAllPagesSelected(false);
    }, [search, paymentFilter, reportFilter]);

    useEffect(() => {
        if (!showSelectionWarning) {
            return;
        }

        const timer = window.setTimeout(() => {
            setShowSelectionWarning(false);
        }, 3200);

        return () => window.clearTimeout(timer);
    }, [showSelectionWarning]);

    useEffect(() => {
        if (!sequenceWarning) {
            return;
        }

        const timer = window.setTimeout(() => {
            setSequenceWarning(null);
        }, 3200);

        return () => window.clearTimeout(timer);
    }, [sequenceWarning]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchTransactions = async () => {
            setIsLoading(true);
            setFetchError(null);
            setRows([]);

            try {
                const query = new URLSearchParams({
                    page: String(page),
                    pageSize: String(PAGE_SIZE),
                });

                if (search.trim()) {
                    query.set("search", search.trim());
                }

                if (paymentFilter !== "Semua Pembayaran") {
                    query.set("payment", paymentFilter);
                }

                if (reportFilter !== "Semua Pelaporan") {
                    query.set("report", reportFilter);
                }

                const response = await fetch(`/api/transactions?${query.toString()}`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Gagal mengambil data transaksi.");
                }

                const result = (await response.json()) as TransactionsApiResponse;

                setRows(result.data);
                setTotalItems(result.pagination.total);
                setTotalPages(Math.max(1, result.pagination.totalPages ?? 1));
                onSummaryChange?.(result.summary);
            } catch (error) {
                if ((error as Error).name === "AbortError") {
                    return;
                }

                setRows([]);
                setTotalItems(0);
                setFetchError("Data transaksi gagal dimuat.");
                onSummaryChange?.({ total: 0, berhasil: 0, tertunda: 0, gagal: 0 });
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchTransactions();

        return () => controller.abort();
    }, [page, search, paymentFilter, reportFilter, onSummaryChange, refreshKey]);

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
            setIsAllPagesSelected(false);
            return;
        }

        setIsAllPagesSelected(true);
        setSelectedIds(rows.map((row) => row.id));
    };

    const toggleSelectRow = (id: string) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            }

            return [...prev, id];
        });
    };

    const handleUpdatePelaporan = async () => {
        if (selectedCount === 0) {
            setShowSelectionWarning(true);
            return;
        }

        setShowSelectionWarning(false);
        setTahap1Date("");
        setTahap2Date("");
        setTahap3Date("");
        setIsPrefillingReport(false);
        setIsProgressModalOpen(true);

        if (!isAllPagesSelected && selectedIds.length === 1) {
            setIsPrefillingReport(true);

            try {
                const response = await fetch(`/api/transactions/${selectedIds[0]}`);
                if (response.ok) {
                    const detail = (await response.json()) as TransactionDetailApiResponse;
                    const savedDates = detail.data?.reportingDates;

                    setTahap1Date(savedDates?.tahap1Date ?? "");
                    setTahap2Date(savedDates?.tahap2Date ?? "");
                    setTahap3Date(savedDates?.tahap3Date ?? "");
                }
            } catch {
                // Keep fields empty if prefill fetch fails.
            } finally {
                setIsPrefillingReport(false);
            }
        }
    };

    const handleOpenConfirmUpdate = () => {
        if (tahap2Date && !tahap1Date) {
            setSequenceWarning("Isi Tahap 1 terlebih dahulu.");
            return;
        }

        if (tahap3Date && (!tahap1Date || !tahap2Date)) {
            setSequenceWarning("Isi Tahap 1 dan Tahap 2 terlebih dahulu.");
            return;
        }

        setIsProgressModalOpen(false);
        setIsConfirmOpen(true);
    };

    const handleConfirmUpdate = async () => {
        setIsSubmittingUpdate(true);

        try {
            const response = await fetch("/api/transactions", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderIds: isAllPagesSelected ? [] : selectedIds,
                    applyToFiltered: isAllPagesSelected,
                    filters: {
                        search,
                        paymentStatus: paymentFilter,
                        reportingStatus: reportFilter,
                    },
                    tahap1Date,
                    tahap2Date,
                    tahap3Date,
                }),
            });

            const result = (await response.json()) as { message?: string };

            if (!response.ok) {
                throw new Error(result.message ?? "Gagal memperbarui status pelaporan.");
            }

            setIsConfirmOpen(false);
            setSelectedIds([]);
            setIsAllPagesSelected(false);
            setTahap1Date("");
            setTahap2Date("");
            setTahap3Date("");
            setFetchError(null);
            setRefreshKey((prev) => prev + 1);
        } catch (error) {
            setFetchError(
                error instanceof Error
                    ? error.message
                    : "Gagal memperbarui status pelaporan.",
            );
        } finally {
            setIsSubmittingUpdate(false);
        }
    };

    return (
        <section className="w-full rounded-xl border border-neutral-100 bg-white p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                {!isTransaksiMode && <h2 className="text-xl leading-10 font-bold text-black">Semua Transaksi</h2>}

                <div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
                    <SearchBar
                        value={search}
                        className="md:flex-1"
                        inputClassName="md:min-w-0"
                        placeholder="Cari invoice, customer, atau produk..."
                        onChange={(value) => {
                            setSearch(value);
                            setPage(1);
                        }}
                    />

                    <FilterPembayaran
                        value={paymentFilter}
                        onChange={(value) => {
                            setPaymentFilter(value as PaymentStatus | "Semua Pembayaran");
                            setPage(1);
                        }}
                    />

                    <FilterPelaporan
                        value={reportFilter}
                        onChange={(value) => {
                            setReportFilter(value as ReportingStatus | "Semua Pelaporan");
                            setPage(1);
                        }}
                    />

                    {isTransaksiMode && (
                        <button
                            type="button"
                            onClick={handleUpdatePelaporan}
                            className="h-10 cursor-pointer rounded-xl bg-primary-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                        >
                            Update Pelaporan
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-100">
                <table className="w-full min-w-260 border-collapse">
                    <thead>
                        <tr className="bg-primary-500 text-left text-white">
                            <th className="px-4 py-3 font-semibold">
                                <div className="flex items-center gap-2">
                                    {isTransaksiMode && (
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-[#F2C879]"
                                        />
                                    )}
                                    <span>Invoice</span>
                                </div>
                            </th>
                            <th className="px-4 py-3 font-semibold">Customer</th>
                            <th className="px-4 py-3 font-semibold">Produk</th>
                            <th className="px-4 py-3 font-semibold">Tanggal Order</th>
                            <th className="px-4 py-3 font-semibold">Nominal (Rp)</th>
                            <th className="px-4 py-3 font-semibold">Pembayaran</th>
                            <th className="px-4 py-3 font-semibold">Pelaporan</th>
                            <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white">
                        {rows.map((item) => (
                            <tr key={item.id} className="border-t border-neutral-50">
                                <td className="px-4 py-3 text-neutral-900">
                                    <div className="flex items-center gap-2">
                                        {isTransaksiMode && (
                                            <input
                                                type="checkbox"
                                                checked={isAllPagesSelected || selectedIds.includes(item.id)}
                                                onChange={() => toggleSelectRow(item.id)}
                                                disabled={isAllPagesSelected}
                                                className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-[#F2C879]"
                                            />
                                        )}
                                        <span>{item.invoice}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-neutral-900">{item.customer}</td>
                                <td className="px-4 py-3 text-neutral-900">{item.produk}</td>
                                <td className="px-4 py-3 text-neutral-900">{item.tanggal}</td>
                                <td className="px-4 py-3 text-neutral-900">{formatRupiah(item.nominal)}</td>
                                <td className="px-4 py-3">
                                    <StatusPembayaranBadge status={item.pembayaran} size="sm" />
                                </td>
                                <td className="px-4 py-3">
                                    <StatusPelaporanBadge status={item.pelaporan} size="sm" />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center">
                                        <Link href={`/admin/transaksi/${item.id}`} className="cursor-pointer text-[#2D7A5B] hover:opacity-80" aria-label={`Lihat ${item.invoice}`}>
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {isLoading && (
                            <tr>
                                <td colSpan={colSpan} className="px-4 py-12">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500"></div>
                                        <p className="text-center font-medium text-neutral-600">Memuat data transaksi...</p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {!isLoading && fetchError && (
                            <tr>
                                <td colSpan={colSpan} className="px-4 py-6 text-center text-red-400">
                                    {fetchError}
                                </td>
                            </tr>
                        )}

                        {!isLoading && !fetchError && rows.length === 0 && (
                            <tr>
                                <td colSpan={colSpan} className="px-4 py-6 text-center text-neutral-400">
                                    Data transaksi tidak ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-sm text-neutral-700">
                    {isTransaksiMode && selectedCount > 0
                        ? isAllPagesSelected
                            ? `${selectedCount} transaksi dipilih (semua halaman)`
                            : `${selectedCount} transaksi dipilih`
                        : ""}
                </p>

                <div className="flex items-center justify-end gap-6">
                    <button
                        type="button"
                        onClick={goPrev}
                        disabled={page === 1}
                        className="h-9 w-9 cursor-pointer rounded-xl border border-primary-500 text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span aria-hidden="true">←</span>
                    </button>

                    <p className="text-md text-black">
                        Halaman {page} dari {totalPages}
                    </p>

                    <button
                        type="button"
                        onClick={goNext}
                        disabled={page === totalPages}
                        className="h-9 w-9 cursor-pointer rounded-xl border border-primary-500 text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span aria-hidden="true">→</span>
                    </button>
                </div>
            </div>

            {isTransaksiMode && showSelectionWarning && (
                <div className="fixed bottom-5 right-5 z-120 w-[min(560px,calc(100vw-2rem))] rounded-xl border border-[#E67E22] bg-[#FFF4E5] px-5 py-4 text-[#E67E22] shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#E67E22] text-base font-bold">!</span>
                        <div>
                            <p className="font-bold">Tidak ada transaksi yang dipilih</p>
                            <p className="mt-1">Silakan pilih minimal 1 transaksi untuk memperbarui pelaporan.</p>
                        </div>
                    </div>
                </div>
            )}

            {isTransaksiMode && sequenceWarning && (
                <div className="fixed bottom-5 right-5 z-120 w-[min(560px,calc(100vw-2rem))] rounded-xl border border-[#E74C3C] bg-[#FDEDEC] px-5 py-4 text-[#C0392B] shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#C0392B] text-base font-bold">!</span>
                        <div>
                            <p className="font-bold">Urutan pelaporan tidak valid</p>
                            <p className="mt-1">{sequenceWarning}</p>
                        </div>
                    </div>
                </div>
            )}

            <UpdatePelaporanModal
                isOpen={isTransaksiMode && isProgressModalOpen}
                isLoading={isPrefillingReport}
                selectedCount={selectedCount}
                tahap1Date={tahap1Date}
                tahap2Date={tahap2Date}
                tahap3Date={tahap3Date}
                onChangeTahap1Date={setTahap1Date}
                onChangeTahap2Date={setTahap2Date}
                onChangeTahap3Date={setTahap3Date}
                onClose={() => setIsProgressModalOpen(false)}
                onApply={handleOpenConfirmUpdate}
            />

            <ConfirmationPopup
                isOpen={isConfirmOpen}
                title="Konfirmasi"
                message="Apakah Anda yakin ingin menyimpan pembaruan status pelaporan ini?"
                confirmLabel="Ya, Simpan"
                cancelLabel="Batal"
                isLoading={isSubmittingUpdate}
                onCancel={() => setIsConfirmOpen(false)}
                onConfirm={() => void handleConfirmUpdate()}
            />
        </section>
    );
}
