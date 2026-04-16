import Link from "next/link";

export type DistributionYearRow = {
    year: number;
    uploadDate: string;
    status: "Tersedia" | "Belum Tersedia";
};

type DocumentationDistributionTableProps = {
    rows: DistributionYearRow[];
    page: number;
    totalPages: number;
    onPrevPage: () => void;
    onNextPage: () => void;
};

export default function DocumentationDistributionTable({
    rows,
    page,
    totalPages,
    onPrevPage,
    onNextPage,
}: DocumentationDistributionTableProps) {
    return (
        <>
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-[#045A63] text-left text-white">
                            <th className="px-4 py-3 font-semibold">Tahun</th>
                            <th className="px-4 py-3 font-semibold">Tanggal Upload</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {rows.map((item) => (
                            <tr key={item.year} className="border-t border-neutral-100 text-neutral-800">
                                <td className="px-4 py-3">{item.year}</td>
                                <td className="px-4 py-3">{item.uploadDate || "-"}</td>
                                <td className="px-4 py-3">{item.status}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end">
                                        <Link
                                            href={`/admin/dokumentasi/${item.year}`}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#0A6C75] hover:bg-[#E6F4F6]"
                                            aria-label={`Buka dokumentasi ${item.year}`}
                                        >
                                            {item.status === "Belum Tersedia" ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 20h9" />
                                                    <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                                                </svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={onPrevPage}
                    disabled={page === 1}
                    className="h-9 w-9 rounded-xl border border-[#0A6C75] text-[#0A6C75] disabled:cursor-not-allowed disabled:opacity-35"
                >
                    <span aria-hidden="true">←</span>
                </button>
                <p className="text-sm text-neutral-700">Halaman {page} dari {totalPages}</p>
                <button
                    type="button"
                    onClick={onNextPage}
                    disabled={page === totalPages}
                    className="h-9 w-9 rounded-xl border border-[#0A6C75] text-[#0A6C75] disabled:cursor-not-allowed disabled:opacity-35"
                >
                    <span aria-hidden="true">→</span>
                </button>
            </div>
        </>
    );
}
