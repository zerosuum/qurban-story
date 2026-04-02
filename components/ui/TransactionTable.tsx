"use client";

import { useEffect, useState } from "react";
import FilterPelaporan from "./FilterPelaporan";
import FilterPembayaran from "./FilterPembayaran";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import StatusPelaporanBadge from "./StatusPelaporanBadge";
import StatusPembayaranBadge from "./StatusPembayaranBadge";

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
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

type TransactionTableProps = {
    onSummaryChange?: (summary: TransactionSummary) => void;
};

const PAGE_SIZE = 10;

function formatRupiah(value: string) {
    const number = Number(value);
    if (Number.isNaN(number)) return value;
    return new Intl.NumberFormat("id-ID").format(number);
}

export default function TransactionTable({ onSummaryChange }: TransactionTableProps) {
    const [rows, setRows] = useState<TransactionRow[]>([]);
    const [search, setSearch] = useState("");
    const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "Semua Pembayaran">("Semua Pembayaran");
    const [reportFilter, setReportFilter] = useState<ReportingStatus | "Semua Pelaporan">("Semua Pelaporan");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const goPrev = () => setPage((prev) => Math.max(1, prev - 1));
    const goNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

    useEffect(() => {
        setPage(1);
    }, [search, paymentFilter, reportFilter]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchTransactions = async () => {
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
                setTotalPages(Math.max(1, result.pagination.totalPages ?? 1));
                onSummaryChange?.(result.summary);
            } catch (error) {
                if ((error as Error).name === "AbortError") {
                    return;
                }

                setRows([]);
                setFetchError("Data transaksi gagal dimuat.");
                onSummaryChange?.({ total: 0, berhasil: 0, tertunda: 0, gagal: 0 });
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();

        return () => controller.abort();
    }, [page, search, paymentFilter, reportFilter, onSummaryChange]);

    return (
        <section className="w-full rounded-xl border border-neutral-100 bg-white p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-xl leading-10 font-bold text-black">Semua Transaksi</h2>

                <div className="flex flex-col gap-2 md:flex-row">
                    <SearchBar
                        value={search}
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
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-100">
                <table className="w-full min-w-260 border-collapse">
                    <thead>
                        <tr className="bg-primary-500 text-left text-white">
                            <th className="px-4 py-3 font-semibold">Invoice</th>
                            <th className="px-4 py-3 font-semibold">Customer</th>
                            <th className="px-4 py-3 font-semibold">Produk</th>
                            <th className="px-4 py-3 font-semibold">Tanggal</th>
                            <th className="px-4 py-3 font-semibold">Nominal (Rp)</th>
                            <th className="px-4 py-3 font-semibold">Pembayaran</th>
                            <th className="px-4 py-3 font-semibold">Pelaporan</th>
                            <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white">
                        {rows.map((item) => (
                            <tr key={item.id} className="border-t border-neutral-50">
                                <td className="px-4 py-3 text-neutral-900">{item.invoice}</td>
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
                                        <button type="button" className="cursor-pointer text-primary-600 hover:opacity-80" aria-label={`Lihat ${item.invoice}`}>
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
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {isLoading && (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-neutral-400">
                                    Memuat data transaksi...
                                </td>
                            </tr>
                        )}

                        {!isLoading && fetchError && (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-red-400">
                                    {fetchError}
                                </td>
                            </tr>
                        )}

                        {!isLoading && !fetchError && rows.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-neutral-400">
                                    Data transaksi tidak ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={goPrev}
                onNext={goNext}
            />
        </section>
    );
}
