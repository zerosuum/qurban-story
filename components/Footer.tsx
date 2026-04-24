"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white text-primary-900 text-center min-h-82.25 px-6 lg:px-30 py-10 lg:py-6 flex flex-col gap-8 lg:gap-4">
      <div className="flex flex-col lg:flex-row items-start text-start justify-between gap-10 lg:gap-0 w-full">
        {/* Bagian Kiri: Logo & Deskripsi */}
        <div className="flex flex-col gap-3.5 w-full lg:max-w-60.75 shrink-0">
          <img src="/brand.svg" alt="Qurban Story" className="w-max" />
          <p className="leading-relaxed">
            Platform qurban digital dengan transparasi pelaporan 3 tahap untuk
            ibadah yang amanah.
          </p>
        </div>

        {/* Bagian Kanan: Wrapper 3 Kolom Navigasi biar rapi di Tablet & HP */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-between gap-10 sm:gap-12 lg:gap-4 w-full lg:w-auto lg:flex-1 lg:ml-16">
          <div className="flex flex-col lg:px-4 py-1 gap-4">
            <p className="font-bold text-[18px] lg:text-base">Navigasi</p>
            <Link href="/" className="hover:opacity-70 transition-opacity">
              Beranda
            </Link>
            <Link href="/" className="hover:opacity-70 transition-opacity">
              Produk
            </Link>
            <Link href="/" className="hover:opacity-70 transition-opacity">
              Masuk
            </Link>
          </div>

          <div className="flex flex-col lg:px-4 py-1 gap-4">
            <p className="font-bold text-[18px] lg:text-base">Layanan Qurban</p>
            <Link href="/" className="hover:opacity-70 transition-opacity">
              Kambing
            </Link>
            <Link href="/" className="hover:opacity-70 transition-opacity">
              Domba
            </Link>
            <Link href="/" className="hover:opacity-70 transition-opacity">
              Sapi 1 Ekor
            </Link>
            <Link href="/" className="hover:opacity-70 transition-opacity">
              Sapi 1/7 Patungan
            </Link>
          </div>

          <div className="flex flex-col lg:px-4 py-1 gap-4">
            <p className="font-bold text-[18px] lg:text-base">Kontak</p>
            <div className="flex flex-row gap-3 items-center">
              <img src="/icons/phone.svg" alt="" className="shrink-0" />
              <Link href="/" className="hover:opacity-70 transition-opacity">
                +62 812-3456-7890
              </Link>
            </div>
            <div className="flex flex-row gap-3 items-center">
              <img src="/icons/whatsapp.svg" alt="" className="shrink-0" />
              <Link href="/" className="hover:opacity-70 transition-opacity">
                WhatsApp
              </Link>
            </div>
            <div className="flex flex-row gap-3 items-center">
              <img src="/icons/mail.svg" alt="" className="shrink-0" />
              <Link href="/" className="hover:opacity-70 transition-opacity">
                info@qurbanstory.id
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Garis Pembatas */}
      <div className="bg-secondary-200 h-px w-full mt-4 lg:mt-0"></div>

      {/* Copyright */}
      <div className="text-sm text-muted-foreground mt-2 lg:mt-4 text-center">
        <p className="text-[14px] md:text-lg">
          &copy; {new Date().getFullYear()} Qurban Story. Seluruh hak cipta
          dilindungi.
        </p>
      </div>
    </footer>
  );
}
