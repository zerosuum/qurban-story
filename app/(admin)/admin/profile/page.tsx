"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import LogoutModal from "@/components/ui/LogoutModal";

export default function AdminProfilePage() {
    const { data: session } = useSession();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    return (
        <section className="p-6">
            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 md:p-6">
                <h1 className="mb-5 text-center text-[36px] leading-11.5 font-bold text-neutral-900">Profil Saya</h1>

                <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)] md:p-5">
                    <h2 className="text-base font-semibold text-neutral-900">Informasi Akun</h2>

                    <div className="mt-5 space-y-4">
                        <div className="space-y-2">
                            <label className="text-base text-neutral-900">Nama Lengkap</label>
                            <input
                                type="text"
                                disabled
                                value={session?.user?.name ?? ""}
                                className="h-10 w-full rounded-xl bg-neutral-50 px-4 text-sm text-neutral-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-base text-neutral-900">Email</label>
                            <input
                                type="text"
                                disabled
                                value={session?.user?.email ?? ""}
                                className="h-10 w-full rounded-xl bg-neutral-50 px-4 text-sm text-neutral-500"
                            />
                        </div>

                        <p className="text-xs text-neutral-300">Nama dan email tidak dapat diubah.</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsLogoutOpen(true)}
                    className="mt-5 flex h-11 w-fit items-center justify-center rounded-xl bg-primary-500 px-6 text-white font-medium transition-all duration-200 hover:bg-primary-600 hover:shadow-md hover:shadow-neutral-200 active:scale-95"
                >
                    Keluar dari Akun
                </button>
            </div>

            <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
        </section>
    );
}
