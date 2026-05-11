"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

export type TambahAdminForm = {
    email: string;
};

type TambahAdminModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmitAdmin: (formData: TambahAdminForm) => Promise<{ message?: string }>;
    onSubmitResult: (status: "success" | "error", message?: string) => void;
};

const initialForm: TambahAdminForm = {
    email: "",
};

export default function TambahAdminModal({ isOpen, onClose, onSubmitAdmin, onSubmitResult }: TambahAdminModalProps) {
    const [form, setForm] = useState<TambahAdminForm>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setForm(initialForm);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        if (!form.email.trim()) {
            onSubmitResult("error", "Email admin wajib diisi.");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await onSubmitAdmin({
                email: form.email.trim(),
            });

            onSubmitResult("success", result.message ?? "Admin berhasil ditambahkan.");
            onClose();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Gagal menambahkan admin.";
            onSubmitResult("error", message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-neutral-800/35 p-4 backdrop-blur-[1px]">
            <div className="relative w-full max-w-140 rounded-xl border border-neutral-100 bg-white p-6 shadow-[0_8px_28px_-6px_rgba(24,39,75,0.12),0_18px_88px_-4px_rgba(24,39,75,0.14)]">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 cursor-pointer text-xl leading-none text-neutral-400 hover:text-neutral-500"
                    aria-label="Tutup form tambah admin"
                    disabled={isSubmitting}
                >
                    x
                </button>

                <p className="text-base font-bold text-black">Tambah Admin</p>

                <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                    <div className="space-y-2">
                        <label htmlFor="email-admin" className="text-sm font-medium text-neutral-700">
                            Email Admin
                        </label>
                        <input
                            id="email-admin"
                            type="email"
                            value={form.email}
                            onChange={(event) => setForm({ email: event.target.value })}
                            placeholder="nama@email.com"
                            className="h-10 w-full rounded-xl border border-neutral-100 px-3 text-sm text-neutral-700 outline-none focus:border-primary-500"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            variant="secondary"
                            className="border border-primary-500 bg-white text-primary-500 hover:bg-neutral-50"
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
