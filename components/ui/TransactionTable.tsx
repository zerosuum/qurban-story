"use client";

import { useEffect, useMemo, useState } from "react";
import FilterPelaporan from "./FilterPelaporan";
import FilterPembayaran from "./FilterPembayaran";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import StatusPelaporanBadge from "./StatusPelaporanBadge";
import StatusPembayaranBadge from "./StatusPembayaranBadge";

type PaymentStatus = "BERHASIL" | "GAGAL" | "KADALUARSA" | "TERTUNDA";
type ReportingStatus = "Tahap 1/3" | "Tahap 2/3" | "Selesai" | "Belum Dimulai";

type TransactionRow = {
    invoice: string;
    customer: string;
    produk: string;
    tanggal: string;
    nominal: string;
    pembayaran: PaymentStatus;
    pelaporan: ReportingStatus;
};

const transactionData: TransactionRow[] = [
    {
        invoice: "INV-2026-001",
        customer: "Siti Aisyah",
        produk: "Kambing Premium",
        tanggal: "15-03-2026",
        nominal: "3.200.000",
        pembayaran: "BERHASIL",
        pelaporan: "Tahap 1/3",
    },
    {
        invoice: "INV-2026-002",
        customer: "Siti Aisyah",
        produk: "Kambing Premium",
        tanggal: "19-03-2026",
        nominal: "3.200.000",
        pembayaran: "KADALUARSA",
        pelaporan: "Belum Dimulai",
    },
    {
        invoice: "INV-2026-003",
        customer: "Siti Aisyah",
        produk: "Sapi Brahmana",
        tanggal: "16-03-2026",
        nominal: "25.000.000",
        pembayaran: "BERHASIL",
        pelaporan: "Tahap 1/3",
    },
    {
        invoice: "INV-2026-004",
        customer: "Siti Aisyah",
        produk: "Domba Pilihan",
        tanggal: "16-03-2026",
        nominal: "2.800.000",
        pembayaran: "GAGAL",
        pelaporan: "Belum Dimulai",
    },
    {
        invoice: "INV-2026-005",
        customer: "Dewi Lestari",
        produk: "Sapi Limosin (Patungan)",
        tanggal: "17-03-2026",
        nominal: "28.000.000",
        pembayaran: "TERTUNDA",
        pelaporan: "Belum Dimulai",
    },
    {
        invoice: "INV-2026-006",
        customer: "Budi Santoso",
        produk: "Kambing Premium",
        tanggal: "18-03-2026",
        nominal: "3.200.000",
        pembayaran: "TERTUNDA",
        pelaporan: "Belum Dimulai",
    },
    {
        invoice: "INV-2026-007",
        customer: "Nurul Huda",
        produk: "Sapi Limosin (Patungan)",
        tanggal: "18-03-2026",
        nominal: "4.000.000",
        pembayaran: "BERHASIL",
        pelaporan: "Belum Dimulai",
    },
    {
        invoice: "INV-2026-008",
        customer: "Fajar Setiawan",
        produk: "Domba Pilihan",
        tanggal: "19-03-2026",
        nominal: "2.800.000",
        pembayaran: "GAGAL",
        pelaporan: "Belum Dimulai",
    },
    {
        invoice: "INV-2026-009",
        customer: "Siti Aisyah",
        produk: "Sapi Limosin (Patungan)",
        tanggal: "15-03-2026",
        nominal: "4.000.000",
        pembayaran: "TERTUNDA",
        pelaporan: "Belum Dimulai",
    },
    {
        invoice: "INV-2026-010",
        customer: "Hendra Saputra",
        produk: "Kambing Super",
        tanggal: "20-03-2026",
        nominal: "4.200.000",
        pembayaran: "BERHASIL",
        pelaporan: "Tahap 2/3",
    },
];

const PAGE_SIZE = 10;

export default function TransactionTable() {
    const [search, setSearch] = useState("");
    const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "Semua Pembayaran">("Semua Pembayaran");
    const [reportFilter, setReportFilter] = useState<ReportingStatus | "Semua Pelaporan">("Semua Pelaporan");
    const [page, setPage] = useState(1);

    const filteredData = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        return transactionData.filter((item) => {
            const matchesSearch =
                keyword.length === 0 ||
                item.invoice.toLowerCase().includes(keyword) ||
                item.customer.toLowerCase().includes(keyword) ||
                item.produk.toLowerCase().includes(keyword);

            const matchesPayment =
                paymentFilter === "Semua Pembayaran" ||
                item.pembayaran === paymentFilter;

            const matchesReport =
                reportFilter === "Semua Pelaporan" ||
                item.pelaporan === reportFilter;

            return matchesSearch && matchesPayment && matchesReport;
        });
    }, [search, paymentFilter, reportFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));

    const paginatedData = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredData.slice(start, start + PAGE_SIZE);
    }, [filteredData, page]);

    const goPrev = () => setPage((prev) => Math.max(1, prev - 1));
    const goNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

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
                        {paginatedData.map((item) => (
                            <tr key={item.invoice} className="border-t border-neutral-50">
                                <td className="px-4 py-3 text-neutral-900">{item.invoice}</td>
                                <td className="px-4 py-3 text-neutral-900">{item.customer}</td>
                                <td className="px-4 py-3 text-neutral-900">{item.produk}</td>
                                <td className="px-4 py-3 text-neutral-900">{item.tanggal}</td>
                                <td className="px-4 py-3 text-neutral-900">{item.nominal}</td>
                                <td className="px-4 py-3">
                                    <StatusPembayaranBadge status={item.pembayaran} size="sm" />
                                </td>
                                <td className="px-4 py-3">
                                    <StatusPelaporanBadge status={item.pelaporan} size="sm" />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center">
                                        <button className="text-primary-600 hover:opacity-80" aria-label={`Lihat ${item.invoice}`}>
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

                        {paginatedData.length === 0 && (
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
