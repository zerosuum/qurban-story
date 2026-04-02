"use client"

import { usePathname } from "next/navigation";

export default function AdminNavbar() {
    const pathname = usePathname();

    const adminName = "SuperAdmin"
    const adminEmail = "superadmin@qurbanstory.com"

    const pageTitle = (() => {
        if (pathname.startsWith("/admin/transaksi")) return "Manajemen Transaksi";
        if (pathname.startsWith("/admin/product")) return "Manajemen Produk";
        if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
        return "Admin";
    })();

    return (
        <div className="bg-white p-8 flex flex-row justify-between w-full h-20 items-center">
            <div>
                <p className="font-semibold">{pageTitle}</p>
            </div>
            <div className="flex flex-row items-center gap-4">
                <div>
                    <img src="/icons/profile.svg" alt="Profile" className="w-8.75 h-8.75" />
                </div>
                <div>
                    <p>{adminName}</p>
                    <p>{adminEmail}</p>
                </div>
            </div>
        </div>
    );
}