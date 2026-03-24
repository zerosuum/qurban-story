"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { status } = useSession();
  const pathname = usePathname();

  const navItem =
    "px-3 py-2 transition-colors duration-200 ease-in-out font-sans";

  const active = "text-primary-500 font-bold";
  const inactive = "text-neutral-400 hover:text-primary-500 font-medium";

  const btnOutline =
    "flex items-center justify-center px-6 h-[44px] border border-primary-500 text-primary-500 rounded-xl hover:bg-neutral-50 hover:text-primary-600 hover:border-primary-600 active:scale-95 transition-all duration-200 font-sans font-medium";

  const btnSolid =
    "flex items-center justify-center px-6 h-[44px] bg-primary-500 text-white rounded-xl hover:bg-primary-600 hover:shadow-md hover:shadow-neutral-200 active:scale-95 transition-all duration-200 font-sans font-medium";

  return (
    <nav className="w-full h-20 bg-white border-b border-secondary-200 flex justify-center sticky top-0 z-50">
      <div className="w-full max-w-360 px-6 xl:px-30 flex items-center justify-between h-full">
        {/* Logo dummy */}
        <Link
          href="/"
          className="font-serif text-[24px] font-bold text-primary-500 flex items-center gap-2 hover:opacity-90 transition-opacity duration-200"
        >
          <img src="/brand.svg" alt="Qurban Story" />
        </Link>

        {/* Menu Tengah */}
        <div className="hidden md:flex items-center gap-4">
          {/* Kalau udah login muncul "Dashboard", kalau belum "Beranda" */}
          {status === "authenticated" ? (
            <Link
              href="/dashboard"
              className={`${navItem} ${pathname === "/dashboard" ? active : inactive}`}
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

          {/* Menu Produk */}
          <Link
            href="/produk"
            className={`${navItem} ${pathname === "/produk" ? active : inactive}`}
          >
            Produk
          </Link>

          {/* Menu Riwayat Transaksi cuma muncul kalau udah login */}
          {status === "authenticated" && (
            <Link
              href="/riwayat-trx"
              className={`${navItem} ${pathname === "/riwayat-trx" ? active : inactive}`}
            >
              Riwayat Transaksi
            </Link>
          )}
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {status === "loading" && (
            <div className="w-[180px] h-[44px] bg-neutral-100 rounded-xl animate-pulse" />
          )}

          {status === "unauthenticated" && (
            <>
              <Link href="/login" className={btnOutline}>
                Masuk
              </Link>
              <Link href="/register" className={btnSolid}>
                Daftar
              </Link>
            </>
          )}

          {status === "authenticated" && (
            <>
              <Link href="/profile" className={btnOutline}>
                Profil Saya
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={btnSolid}
              >
                Keluar
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
