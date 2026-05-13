"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutModal from "@/components/ui/LogoutModal";

export default function Navbar() {
  const { status, data: session } = useSession();
  const pathname = usePathname();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const role = session?.user?.role;
  const dashboardHref =
    role === "ADMIN" || role === "SUPERADMIN"
      ? "/admin/dashboard"
      : "/dashboard";

  const navItem =
    "px-3 py-2 transition-colors duration-200 ease-in-out font-sans";

  const active = "text-primary-500 font-bold";
  const inactive = "text-neutral-400 hover:text-primary-500 font-medium";

  const btnOutline =
    "flex items-center justify-center px-6 h-[44px] border border-primary-500 text-primary-500 rounded-xl hover:bg-neutral-50 hover:text-primary-600 hover:border-primary-600 active:scale-95 transition-all duration-200 font-sans font-medium w-full md:w-auto";

  const btnSolid =
    "flex items-center justify-center px-6 h-[44px] bg-primary-500 text-white rounded-xl hover:bg-primary-600 hover:shadow-md hover:shadow-neutral-200 active:scale-95 transition-all duration-200 font-sans font-medium w-full md:w-auto";

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="w-full h-20 bg-white border-b border-secondary-200 flex justify-center sticky top-0 z-50">
      <div className="w-full max-w-[1440px] px-6 xl:px-30 flex items-center justify-between h-full bg-white relative z-50">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="font-serif text-[24px] font-bold text-primary-500 flex items-center gap-2 hover:opacity-90 transition-opacity duration-200"
        >
          <img src="/brand.svg" alt="Qurban Story" />
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 focus:outline-none"
        >
          <span
            className={`block w-6 h-0.5 bg-neutral-800 transition-transform duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-neutral-800 transition-opacity duration-300 ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-neutral-800 transition-transform duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>

        <div className="hidden md:flex items-center gap-4">
          {status === "authenticated" ? (
            <Link
              href={dashboardHref}
              className={`${navItem} ${
                pathname === "/dashboard" ||
                pathname.startsWith("/admin/dashboard")
                  ? active
                  : inactive
              }`}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/"
              className={`${navItem} ${pathname === "/" ? active : inactive}`}
            >
              Beranda
            </Link>
          )}

          <Link
            href="/produk"
            className={`${navItem} ${pathname === "/produk" ? active : inactive}`}
          >
            Produk
          </Link>

          {status === "authenticated" && (
            <Link
              href="/riwayat-trx"
              className={`${navItem} ${pathname === "/riwayat-trx" ? active : inactive}`}
            >
              Riwayat Transaksi
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {status === "loading" && (
            <div className="h-11 w-45 rounded-xl bg-neutral-100 animate-pulse" />
          )}

          {status === "unauthenticated" && (
            <>
              <Link
                href="/login"
                className={btnSolid}
                onClick={closeMobileMenu}
              >
                Masuk
              </Link>
              {/* <Link href="/register" className={btnSolid}>
                Daftar
              </Link> */}
            </>
          )}

          {status === "authenticated" && (
            <>
              <Link href="/profile" className={btnOutline}>
                Profil Saya
              </Link>
              <button
                onClick={() => setIsLogoutOpen(true)}
                className={btnSolid}
              >
                Keluar
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className={`absolute top-20 left-0 w-full bg-white border-b border-neutral-200 flex flex-col px-6 py-6 gap-6 transition-all duration-300 md:hidden z-40 ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        {/* Links Mobile */}
        <div className="flex flex-col gap-2">
          {status === "authenticated" ? (
            <Link
              href={dashboardHref}
              onClick={closeMobileMenu}
              className={`${navItem} ${
                pathname === "/dashboard" ||
                pathname.startsWith("/admin/dashboard")
                  ? active
                  : inactive
              }`}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/"
              onClick={closeMobileMenu}
              className={`${navItem} ${pathname === "/" ? active : inactive}`}
            >
              Beranda
            </Link>
          )}

          <Link
            href="/produk"
            onClick={closeMobileMenu}
            className={`${navItem} ${pathname === "/produk" ? active : inactive}`}
          >
            Produk
          </Link>

          {status === "authenticated" && (
            <Link
              href="/riwayat-trx"
              onClick={closeMobileMenu}
              className={`${navItem} ${pathname === "/riwayat-trx" ? active : inactive}`}
            >
              Riwayat Transaksi
            </Link>
          )}
        </div>

        <hr className="border-neutral-100" />

        {/* Auth Section Mobile */}
        <div className="flex flex-col gap-3">
          {status === "loading" && (
            <div className="h-11 w-full rounded-xl bg-neutral-100 animate-pulse" />
          )}

          {status === "unauthenticated" && (
            <>
              <Link href="/login" className={btnSolid}>
                Masuk
              </Link>
              {/* <Link
                href="/register"
                onClick={closeMobileMenu}
                className={btnSolid}
              >
                Daftar
              </Link> */}
            </>
          )}

          {status === "authenticated" && (
            <>
              <Link
                href="/profile"
                onClick={closeMobileMenu}
                className={btnOutline}
              >
                Profil Saya
              </Link>
              <button
                onClick={() => {
                  closeMobileMenu();
                  setIsLogoutOpen(true);
                }}
                className={btnSolid}
              >
                Keluar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal Logout */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
    </nav>
  );
}
