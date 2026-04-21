"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import ConfirmationPopup from "@/components/ui/ConfirmationPopup";
import StatusAlert from "@/components/ui/StatusAlert";
import TambahAdminModal from "@/components/ui/TambahAdminModal";
import type { TambahAdminForm } from "@/components/ui/TambahAdminModal";

type AdminRole = "SUPERADMIN" | "ADMIN";

type AdminRow = {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
};

type ActionAlert = {
    type: "success" | "error";
    title: string;
    message: string;
};

type AdminsApiResponse = {
    data: AdminRow[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

type ApiMessageResponse = {
    message?: string;
};

const PAGE_SIZE = 10;

function formatRole(role: AdminRole) {
    return role === "SUPERADMIN" ? "Super Admin" : "Admin";
}

function TrashIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M6 6l1 14h10l1-14" />
            <path d="M10 10v7" />
            <path d="M14 10v7" />
        </svg>
    );
}

export default function ManajemenAdminPage() {
    const [admins, setAdmins] = useState<AdminRow[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [actionAlert, setActionAlert] = useState<ActionAlert | null>(null);
    const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<AdminRow | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchAdmins = async () => {
            setIsLoading(true);
            setFetchError(null);
            setAdmins([]);

            try {
                const query = new URLSearchParams({
                    page: String(page),
                    pageSize: String(PAGE_SIZE),
                });

                if (search.trim()) {
                    query.set("search", search.trim());
                }

                const response = await fetch(`/api/admins?${query.toString()}`, {
                    signal: controller.signal,
                });

                const result = (await response.json()) as AdminsApiResponse & ApiMessageResponse;

                if (!response.ok) {
                    throw new Error(result.message ?? "Gagal mengambil data admin.");
                }

                setAdmins(result.data);
                setTotalPages(Math.max(1, result.pagination.totalPages ?? 1));
            } catch (error) {
                if ((error as Error).name === "AbortError") {
                    return;
                }

                setAdmins([]);
                setTotalPages(1);
                setFetchError(error instanceof Error ? error.message : "Data admin gagal dimuat.");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchAdmins();

        return () => controller.abort();
    }, [page, search, refreshKey]);

    useEffect(() => {
        setPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

    useEffect(() => {
        if (!actionAlert) {
            return;
        }

        const timer = window.setTimeout(() => {
            setActionAlert(null);
        }, 3500);

        return () => window.clearTimeout(timer);
    }, [actionAlert]);

    const goPrev = () => setPage((prev) => Math.max(1, prev - 1));
    const goNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleRequestDelete = (admin: AdminRow) => {
        setDeleteTarget(admin);
        setIsDeleteConfirmOpen(true);
    };

    const handleCloseDelete = () => {
        if (isDeleting) {
            return;
        }

        setIsDeleteConfirmOpen(false);
        setDeleteTarget(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/admins/${deleteTarget.id}`, {
                method: "DELETE",
            });

            const result = (await response.json()) as ApiMessageResponse;

            if (!response.ok) {
                throw new Error(result.message ?? "Gagal menghapus admin.");
            }

            setActionAlert({
                type: "success",
                title: "Berhasil!",
                message: result.message ?? `Admin ${deleteTarget.name} berhasil dihapus.`,
            });
            setIsDeleteConfirmOpen(false);
            setDeleteTarget(null);
            setRefreshKey((prev) => prev + 1);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus admin.";
            setActionAlert({
                type: "error",
                title: "Terjadi Kesalahan.",
                message,
            });
            setIsDeleteConfirmOpen(false);
            setDeleteTarget(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreateAdmin = async (formData: TambahAdminForm) => {
        const response = await fetch("/api/admins", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: formData.email,
            }),
        });

        const result = (await response.json()) as ApiMessageResponse;

        if (!response.ok) {
            throw new Error(result.message ?? "Gagal menambahkan admin.");
        }

        setRefreshKey((prev) => prev + 1);

        return {
            message: result.message,
        };
    };

    const handleSubmitResult = (status: "success" | "error", message?: string) => {
        setActionAlert({
            type: status,
            title: status === "success" ? "Berhasil!" : "Terjadi Kesalahan.",
            message: message ?? (status === "success" ? "Admin berhasil ditambahkan." : "Gagal menambahkan admin."),
        });
    };

    return (
        <main>
            <StatusAlert
                isOpen={Boolean(actionAlert)}
                type={actionAlert?.type ?? "success"}
                title={actionAlert?.title ?? ""}
                message={actionAlert?.message ?? ""}
            />

            <section className="p-6">
                <div className="rounded-xl border border-neutral-100 bg-white p-5">
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xl font-bold text-neutral-900">Manajemen Admin</p>
                            <p className="text-lg font-medium text-neutral-900">Lihat data akun admin yang tersedia.</p>
                        </div>

                        <Button
                            type="button"
                            onClick={() => setIsTambahModalOpen(true)}
                        >
                            Tambah Admin
                        </Button>
                    </div>

                    <div className="mb-4 max-w-115">
                        <SearchBar value={search} onChange={handleSearchChange} />
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-neutral-100">
                        <table className="w-full min-w-220 border-collapse">
                            <thead>
                                <tr className="bg-primary-500 text-left text-white">
                                    <th className="px-5 py-3 font-semibold">No</th>
                                    <th className="px-5 py-3 font-semibold">Nama Admin</th>
                                    <th className="px-5 py-3 font-semibold">Email</th>
                                    <th className="px-5 py-3 font-semibold">Role</th>
                                    <th className="px-5 py-3 text-center font-semibold">Aksi</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-8 text-center text-neutral-400">
                                            Memuat data admin...
                                        </td>
                                    </tr>
                                ) : fetchError ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-8 text-center text-red-400">
                                            {fetchError}
                                        </td>
                                    </tr>
                                ) : admins.length > 0 ? (
                                    admins.map((admin, index) => (
                                        <tr key={admin.id} className="border-t border-neutral-50">
                                            <td className="px-5 py-4 text-base text-neutral-900">{(page - 1) * PAGE_SIZE + index + 1}.</td>
                                            <td className="px-5 py-4 text-base text-neutral-900">{admin.name}</td>
                                            <td className="px-5 py-4 text-base text-neutral-900">{admin.email}</td>
                                            <td className="px-5 py-4 text-base text-neutral-900">{formatRole(admin.role)}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-center">
                                                    {admin.role === "SUPERADMIN" ? (
                                                        <p className="text-base text-neutral-300">-</p>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRequestDelete(admin)}
                                                            className="cursor-pointer text-[#D03333] transition-opacity hover:opacity-80"
                                                            aria-label={`Hapus ${admin.name}`}
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-8 text-center text-neutral-400">
                                            Data admin tidak ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination page={page} totalPages={totalPages} onPrev={goPrev} onNext={goNext} />
                </div>
            </section>

            <ConfirmationPopup
                isOpen={isDeleteConfirmOpen}
                title="Konfirmasi Hapus Admin"
                message={deleteTarget ? `Apakah Anda yakin ingin menghapus admin ${deleteTarget.name}?` : "Apakah Anda yakin ingin menghapus admin ini?"}
                confirmLabel="Ya, Hapus"
                cancelLabel="Batal"
                isLoading={isDeleting}
                onCancel={handleCloseDelete}
                onConfirm={() => void handleConfirmDelete()}
            />

            <TambahAdminModal
                isOpen={isTambahModalOpen}
                onClose={() => setIsTambahModalOpen(false)}
                onSubmitAdmin={handleCreateAdmin}
                onSubmitResult={handleSubmitResult}
            />
        </main>
    );
}