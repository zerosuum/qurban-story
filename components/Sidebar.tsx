"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

type SidebarRole = "ADMIN" | "SUPERADMIN" | "CUSTOMER" | string;

type SidebarMenu = {
    name: string;
    href: string;
    icons: string;
    allowedRoles?: SidebarRole[];
};

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const role = session?.user?.role;

    const menus: SidebarMenu[] = [
        { name: "Dashboard", href: "/admin/dashboard", icons: "dashboard" },
        { name: "Transaksi", href: "/admin/transaksi", icons: "request_quote" },
        { name: "Produk", href: "/admin/product", icons: "shopping_bag" },
        { name: "Customer", href: "/admin/customer", icons: "customer" },
        { name: "Manajemen Admin", href: "/admin/manajemen-admin", icons: "admin_panel_settings", allowedRoles: ["SUPERADMIN"] },
        { name: "Dokumentasi Distribusi", href: "/admin/dokumentasi", icons: "videocam" },
    ];

    const filteredMenus = menus.filter((menu) => {
        if (!menu.allowedRoles) {
            return true;
        }

        if (!role) {
            return false;
        }

        return menu.allowedRoles.includes(role);
    });

    return (
        <aside className="fixed inset-y-0 left-0 z-40 w-66 bg-white border-r border-secondary-200 h-screen flex flex-col justify-between overflow-y-auto">
            <div>
                <div className="h-fit flex items-center justify-center py-4 px-6 border-b border-secondary-200">
                    <img src="/brand.svg" alt="Brand Logo" />
                </div>
                <div className="px-2 mt-2">
                    <p className="font-bold py-1 px-4">Menu Utama</p>
                    <nav className="flex flex-col gap-1 ">
                        {filteredMenus.map((menu) => (
                            <Link
                                key={menu.href}
                                href={menu.href}
                                className={`py-2 px-4 rounded-lg ${pathname === menu.href ? "bg-white border border-primary-500 text-primary-500 font-medium shadow" : "text-neutral-600 hover:bg-neutral-50 hover:text-primary-700 transition-colors duration-200"}`}
                            >
                                <div className="flex items-center gap-1">
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        <img src={`/icons/${menu.icons}.svg`} alt={menu.name} />
                                    </div>
                                    <p>{menu.name}</p>
                                </div>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
            <div className="px-2 py-2 border-t border-secondary-200">
                <Link href="/admin/profile">
                    <div className="py-2 px-4 flex items-center gap-2 rounded-lg text-neutral-600 hover:bg-neutral-50 hover:text-primary-700 transition-colors duration-200 cursor-pointer">
                        <div>
                            <img src="/icons/profile.svg" alt="Profile" />
                        </div>
                        <p>Profil Saya</p>
                    </div>
                </Link>
            </div>
        </aside>
    );

}