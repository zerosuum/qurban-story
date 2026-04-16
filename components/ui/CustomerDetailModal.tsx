type ReportingStatus = "Tahap 1/3" | "Tahap 2/3" | "Selesai" | "Belum Dimulai";

type CustomerTransaction = {
    id: string;
    invoice: string;
    reportingStatus: ReportingStatus;
};

export type CustomerDetailData = {
    id: string;
    name: string;
    email: string;
    phone: string;
    lastTransactionDate: string;
    totalTransactions: number;
    transactions: CustomerTransaction[];
};

type CustomerDetailModalProps = {
    isOpen: boolean;
    isLoading?: boolean;
    customer: CustomerDetailData | null;
    onClose: () => void;
};

function ReadOnlyField({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-base text-neutral-900">{label}</label>
            <input
                value={value}
                readOnly
                className="h-12 rounded-lg border border-neutral-100 bg-neutral-50 px-3 text-sm text-neutral-400 outline-none"
            />
        </div>
    );
}

export default function CustomerDetailModal({ isOpen, isLoading = false, customer, onClose }: CustomerDetailModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
            <div className="w-150 max-w-[calc(100vw-2rem)] rounded-xl border border-neutral-100 bg-white pt-6 pr-8 pb-6 pl-8">
                <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between">
                        <h2 className="text-base font-bold text-neutral-900">Detail Customer</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer text-2xl leading-none text-neutral-500 hover:text-neutral-700"
                            aria-label="Tutup modal detail customer"
                        >
                            ×
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="py-10 text-center text-neutral-400">Memuat detail customer...</div>
                    ) : customer ? (
                        <>
                            <ReadOnlyField label="Nama" value={customer.name} />
                            <ReadOnlyField label="Email" value={customer.email} />
                            <ReadOnlyField label="Nomor Handphone" value={customer.phone} />

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <ReadOnlyField label="Total Transaksi" value={String(customer.totalTransactions)} />
                                <ReadOnlyField label="Transaksi Terakhir" value={customer.lastTransactionDate} />
                            </div>

                            <p className="text-center text-sm text-neutral-400">Admin tidak dapat mengubah data customer.</p>

                            <div>
                                <p className="mb-3 text-base font-medium text-neutral-900">Daftar Transaksi</p>
                                <div className="space-y-2">
                                    {customer.transactions.map((transaction, index) => (
                                        <div
                                            key={transaction.id}
                                            className="flex flex-col gap-2 rounded-lg border border-transparent px-1 py-1 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
                                                <p className="text-base text-neutral-700">
                                                    {index + 1}. {transaction.invoice}
                                                </p>
                                                <p className="text-base text-neutral-700">{transaction.reportingStatus}</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="h-10 w-fit rounded-xl border border-primary-500 px-5 text-base font-semibold text-primary-700"
                                            >
                                                Lihat Transaksi
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-10 text-center text-red-400">Detail customer gagal dimuat.</div>
                    )}
                </div>
            </div>
        </div>
    );
}