"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/ui/SearchBar";
import CustomerDetailModal, { CustomerDetailData } from "@/components/ui/CustomerDetailModal";

type CustomerRow = {
    id: string;
    name: string;
    email: string;
    phone: string;
    lastTransactionDate: string;
    totalTransactions: number;
    paymentStatus: PaymentStatus;
    reportStatus: ReportingStatus;
};

const PAGE_SIZE = 7;

type CustomersApiResponse = {
    data: CustomerRow[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

type CustomerDetailApiResponse = {
    data: CustomerDetailData;
};

export default function CustomerPage() {
    const [rows, setRows] = useState<CustomerRow[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetailData | null>(null);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchCustomers = async () => {
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

                const response = await fetch(`/api/customers?${query.toString()}`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Gagal mengambil data customer.");
                }

                const result = (await response.json()) as CustomersApiResponse;
                setRows(result.data);
                setTotalPages(Math.max(1, result.pagination.totalPages ?? 1));
            } catch (error) {
                if ((error as Error).name === "AbortError") {
                    return;
                }

                setRows([]);
                setTotalPages(1);
                setFetchError("Data customer gagal dimuat.");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchCustomers();

        return () => controller.abort();
    }, [page, search]);

    const paginatedCustomers = rows;

    const goPrev = () => setPage((prev) => Math.max(1, prev - 1));
    const goNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

    const handleOpenCustomerDetail = async (customerId: string) => {
        setIsModalOpen(true);
        setIsModalLoading(true);
        setSelectedCustomer(null);

        try {
            const response = await fetch(`/api/customers/${customerId}`);

            if (!response.ok) {
                throw new Error("Gagal mengambil detail customer.");
            }

            const result = (await response.json()) as CustomerDetailApiResponse;
            setSelectedCustomer(result.data);
        } catch {
            setIsModalOpen(false);
        } finally {
            setIsModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
        setIsModalLoading(false);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    return (
        <main className="p-6">
            <div className="rounded-xl border border-neutral-100 bg-white p-5">
                <div className="mb-5">
                    <p className="text-base font-bold text-neutral-900">Manajemen Customer</p>
                    <p className="text-base font-medium text-neutral-900">Lihat data customer dan riwayat transaksi.</p>
                </div>

                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
                    <SearchBar value={search} onChange={handleSearchChange} className="md:flex-1" />
                </div>

                <div className="overflow-x-auto rounded-xl border border-neutral-100">
                    <table className="w-full min-w-220 border-collapse">
                        <thead>
                            <tr className="bg-primary-500 text-left text-white">
                                <th className="px-5 py-3 font-semibold">No</th>
                                <th className="px-5 py-3 font-semibold">Nama Customer</th>
                                <th className="px-5 py-3 font-semibold">Email</th>
                                <th className="px-5 py-3 font-semibold">Nomor handphone</th>
                                <th className="px-5 py-3 font-semibold">Terakhir Transaksi</th>
                                <th className="px-5 py-3 font-semibold">Total Transaksi</th>
                                <th className="px-5 py-3 text-center font-semibold">Aksi</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white">
                            {isLoading && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center text-neutral-400">
                                        Memuat data customer...
                                    </td>
                                </tr>
                            )}

                            {!isLoading && fetchError && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center text-red-400">
                                        {fetchError}
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !fetchError && paginatedCustomers.length > 0 ? (
                                paginatedCustomers.map((customer, index) => (
                                    <tr key={customer.id} className="border-t border-neutral-50">
                                        <td className="px-5 py-4 text-base text-neutral-900">{(page - 1) * PAGE_SIZE + index + 1}.</td>
                                        <td className="px-5 py-4 text-base text-neutral-900">{customer.name}</td>
                                        <td className="px-5 py-4 text-base text-neutral-900">{customer.email}</td>
                                        <td className="px-5 py-4 text-base text-neutral-900">{customer.phone}</td>
                                        <td className="px-5 py-4 text-base text-neutral-900">{customer.lastTransactionDate}</td>
                                        <td className="px-5 py-4 text-base text-neutral-900">{customer.totalTransactions}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => void handleOpenCustomerDetail(customer.id)}
                                                    className="cursor-pointer text-[#2D7A5B] transition-opacity hover:opacity-80"
                                                    aria-label={`Lihat detail ${customer.name}`}
                                                >
                                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : !isLoading && !fetchError ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center text-neutral-400">
                                        Data customer tidak ditemukan.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 flex items-center justify-end gap-6">
                    <button
                        type="button"
                        onClick={goPrev}
                        disabled={page === 1}
                        className="h-10 w-10 cursor-pointer rounded-xl border border-primary-500 text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span aria-hidden="true">←</span>
                    </button>

                    <p className="text-base text-neutral-900">
                        Halaman {page} dari {totalPages}
                    </p>

                    <button
                        type="button"
                        onClick={goNext}
                        disabled={page === totalPages}
                        className="h-10 w-10 cursor-pointer rounded-xl border border-primary-500 text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span aria-hidden="true">→</span>
                    </button>
                </div>
            </div>

            <CustomerDetailModal customer={selectedCustomer} isOpen={isModalOpen} isLoading={isModalLoading} onClose={handleCloseModal} />
        </main>
    );
}
