import StatusPelaporanBadge from "./StatusPelaporanBadge";

type ReportingRow = {
    invoice: string;
    customer: string;
    produk: string;
    tahap1: "success" | "pending" | "none";
    tahap2: "success" | "pending" | "none";
    tahap3: "success" | "pending" | "none";
    status: "Tahap 1/3" | "Tahap 2/3" | "Selesai" | "Belum Dimulai";
};

const reportingData: ReportingRow[] = [
    {
        invoice: "INV-2026-001",
        customer: "Siti Aisyah",
        produk: "Kambing Premium",
        tahap1: "success",
        tahap2: "pending",
        tahap3: "none",
        status: "Tahap 1/3",
    },
    {
        invoice: "INV-2026-002",
        customer: "Siti Aisyah",
        produk: "Kambing Premium",
        tahap1: "none",
        tahap2: "none",
        tahap3: "none",
        status: "Belum Dimulai",
    },
    {
        invoice: "INV-2026-003",
        customer: "Siti Aisyah",
        produk: "Sapi Brahmana",
        tahap1: "success",
        tahap2: "success",
        tahap3: "pending",
        status: "Tahap 2/3",
    },
    {
        invoice: "INV-2026-004",
        customer: "Siti Aisyah",
        produk: "Domba Pilihan",
        tahap1: "none",
        tahap2: "none",
        tahap3: "none",
        status: "Belum Dimulai",
    },
    {
        invoice: "INV-2026-005",
        customer: "Dewi Lestari",
        produk: "Sapi Limosin (Patungan)",
        tahap1: "none",
        tahap2: "none",
        tahap3: "none",
        status: "Belum Dimulai",
    },
];

const getStageIcon = (stage: "success" | "pending" | "none") => {
    if (stage === "success") {
        return (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-green-600"
            >
                <polyline points="20 6 9 17 4 12" />
            </svg>
        );
    } else if (stage === "pending") {
        return (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-yellow-500"
            >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        );
    }
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-neutral-300"
        >
            <circle cx="12" cy="12" r="10" />
        </svg>
    );
};

export default function ReportingTable() {
    return (
        <section className="w-full rounded-xl border border-neutral-100 bg-white p-5">
            <div className="pb-4">
                <h2 className="text-2xl font-bold text-neutral-900">
                    Tabel Pelaporan
                </h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-100">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-primary-600 text-left text-white">
                            <th className="px-4 py-3 font-semibold">Invoice</th>
                            <th className="px-4 py-3 font-semibold">Customer</th>
                            <th className="px-4 py-3 font-semibold">Produk</th>
                            <th className="px-4 py-3 text-center font-semibold">Tahap 1</th>
                            <th className="px-4 py-3 text-center font-semibold">Tahap 2</th>
                            <th className="px-4 py-3 text-center font-semibold">Tahap 3</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white">
                        {reportingData.map((item) => (
                            <tr key={item.invoice} className="border-t border-neutral-50">
                                <td className="px-4 py-3 text-neutral-900">{item.invoice}</td>
                                <td className="px-4 py-3 text-neutral-900">{item.customer}</td>
                                <td className="px-4 py-3 text-neutral-900">{item.produk}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center">
                                        {getStageIcon(item.tahap1)}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center">
                                        {getStageIcon(item.tahap2)}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center">
                                        {getStageIcon(item.tahap3)}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <StatusPelaporanBadge status={item.status} size="sm" />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center">
                                        <button className="text-primary-600 hover:opacity-80">
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
                    </tbody>
                </table>
            </div>
        </section>
    );
}
