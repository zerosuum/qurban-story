"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CheckoutNiat,
  CheckoutMetode,
  CheckoutTotal,
  CheckoutQuotaInput,
} from "@/components/ui/CheckoutCards";
import CancelModal from "@/components/ui/CancelModal";

// Tipe data untuk fetching produk
type ProductDetailResponse = {
  id: string;
  name: string;
  weight: string | null;
  price: string;
  promoPrice: string | null;
  images: { imageUrl: string; isPrimary: boolean }[];
};

function formatRupiah(value: string | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value));
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data: session, status } = useSession();

  // State untuk modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // States baru buat integrasi
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [qurbanName, setQurbanName] = useState("");

  // 1. Fetch data produk berdasarkan ID
  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Gagal fetch produk");
        const json = await res.json();
        setProduct(json.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsProductLoading(false);
      }
    };
    void fetchDetail();
  }, [id]);

  // 2. Pre-fill nama dari session kalau user udah login
  useEffect(() => {
    if (session?.user?.name) {
      setDonorName(session.user.name);
    }
  }, [session]);

  // Redirect paksa kalau belum login
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // 3. Fungsi Utama Checkout ke Midtrans
  const handleCheckout = async () => {
    if (!donorName || !donorPhone) {
      alert("Mohon lengkapi Nama Pequrban dan Nomor Telepon.");
      return;
    }

    const isPatungan = product?.name.toLowerCase().includes("patungan");

    const finalQurbanName = qurbanName.trim() !== "" ? qurbanName : donorName;

    setIsCheckoutLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          donorName: donorName,
          donorPhone: donorPhone,
          participants: isPatungan ? [donorName] : [finalQurbanName],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memproses checkout");
      }

      // Panggil Snap Midtrans pakai token dari Backend
      window.snap.pay(data.token, {
        onSuccess: function (result: unknown) {
          console.log("Success:", result);
          router.push(`/invoice/${data.orderId}`); // <-- ARAHIN KE INVOICE
        },
        onPending: function (result: unknown) {
          console.log("Pending:", result);
          router.push(`/invoice/${data.orderId}`); // <-- ARAHIN KE INVOICE
        },
        onError: function (result: unknown) {
          console.log("Error:", result);
          router.push(`/invoice/${data.orderId}`); // <-- ARAHIN KE INVOICE
        },
        onClose: function () {
          console.log("User nutup popup sebelum bayar");
          router.push(`/invoice/${data.orderId}`); // <-- ARAHIN KE INVOICE
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Terjadi kesalahan sistem.");
      }
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Tampilan Loading
  if (isProductLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] w-full flex justify-center items-center">
        <span className="text-neutral-500 font-medium">
          Menyiapkan halaman checkout...
        </span>
      </div>
    );
  }

  // Tampilan Error / Tidak Ditemukan
  if (!product) {
    return (
      <div className="min-h-[calc(100vh-80px)] w-full flex justify-center items-center flex-col gap-4">
        <span className="text-neutral-500 font-medium">
          Produk tidak ditemukan.
        </span>
        <Link href="/produk" className="text-primary-600 underline">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  // Siapin data buat UI
  const mainImage =
    product.images.find((img) => img.isPrimary)?.imageUrl ||
    product.images[0]?.imageUrl ||
    "/hewan/sapi.png";
  const isPatungan = product.name.toLowerCase().includes("patungan");
  const finalPrice = product.promoPrice || product.price;

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-white flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-[792px] flex flex-col gap-6">
        {/* Header & Tombol Kembali */}
        <div className="flex flex-col gap-4">
          <Link
            href="/produk"
            className="flex items-center gap-2 w-full px-0 pt-6 pb-2 text-primary-600 font-bold text-[16px] leading-6"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0"
            >
              <mask
                id="mask0_back"
                style={{ maskType: "alpha" }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="24"
                height="24"
              >
                <rect width="24" height="24" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_back)">
                <path
                  d="M10 18L4 12L10 6L11.4 7.45L7.85 11H20V13H7.85L11.4 16.55L10 18Z"
                  fill="#033C46"
                />
              </g>
            </svg>
            <span>Kembali</span>
          </Link>
          <h1 className="font-sans text-[24px] md:text-[32px] font-bold text-neutral-900">
            Checkout
          </h1>
        </div>

        {/* 1. CARD: SUMMARY HEWAN */}
        <div className="flex items-center gap-4 w-full p-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-neutral-100">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-sans text-[18px] font-bold text-neutral-900">
              {product.name}
            </h3>
            <p className="font-sans text-[14px] text-neutral-600">
              Berat {product.weight || "Tidak spesifik"}
            </p>
            <p className="font-sans text-[18px] font-bold text-primary-600 mt-1">
              {formatRupiah(finalPrice)}
            </p>
          </div>
        </div>

        {/* 2. CARD: DATA PEQURBAN */}
        <div className="flex flex-col items-start w-full p-4 px-6 gap-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
          <h2 className="font-sans text-[18px] font-bold text-neutral-900 w-full">
            Data Pequrban
          </h2>

          <div className="flex flex-col gap-1 w-full">
            <label className="font-sans text-[14px] font-medium text-neutral-900">
              Nama Pequrban/Donatur
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[14px] text-neutral-900 outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="font-sans text-[14px] font-medium text-neutral-900">
              Nomor Telepon
            </label>
            <input
              type="tel"
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              placeholder="081233445566"
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[14px] text-neutral-900 outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="font-sans text-[14px] font-medium text-neutral-900">
              Email
            </label>
            <input
              type="email"
              value={session?.user?.email || ""}
              disabled
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[14px] text-neutral-500 bg-neutral-50 outline-none"
            />
            <p className="font-sans text-[12px] text-neutral-400">
              Otomatis terisi dari akun Anda.
            </p>
          </div>
        </div>

        {/* 3. CARD: INPUT QUOTA NAMA PATUNGAN / UTUH */}
        {!isPatungan ? (
          <div className="flex flex-col items-start w-full p-4 px-6 gap-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
            <h2 className="font-sans text-[18px] font-bold text-neutral-900 w-full">
              Nama yang Berqurban
            </h2>
            <div className="flex flex-col gap-1 w-full">
              <label className="font-sans text-[14px] font-medium text-neutral-900">
                Niat qurban atas nama
              </label>
              <input
                type="text"
                value={qurbanName}
                onChange={(e) => setQurbanName(e.target.value)}
                placeholder={donorName || "Masukkan nama yang berqurban"}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[14px] text-neutral-900 outline-none focus:border-primary-500"
              />
            </div>
          </div>
        ) : (
          <CheckoutQuotaInput maxQuota={7} />
        )}

        {/* 4. CARD: CATATAN NIAT */}
        <CheckoutNiat nama={isPatungan ? donorName : qurbanName} />

        {/* 5. CARD: METODE PEMBAYARAN */}
        <CheckoutMetode />

        {/* 6. BOTTOM SECTION: TOTAL & BUTTONS */}
        <div className="flex flex-col gap-4 mt-2">
          {/* Mengirimkan harga dinamis ke CheckoutTotal jika komponennya mendukung props total */}
          <CheckoutTotal total={formatRupiah(finalPrice)} />

          <div className="flex gap-4 w-full">
            <button
              onClick={() => setIsCancelModalOpen(true)}
              disabled={isCheckoutLoading}
              className="flex-1 flex justify-center items-center h-[40px] px-4 py-2 gap-2.5 rounded-xl bg-neutral-200 text-[#000000] font-bold text-[16px] hover:bg-neutral-300 hover:text-primary-600 hover:border-primary-600 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              Batalkan
            </button>
            <button
              onClick={handleCheckout}
              disabled={isCheckoutLoading}
              className="flex-1 flex justify-center items-center h-[40px] px-4 py-2 gap-2.5 rounded-xl bg-primary-600 text-white font-bold text-[16px] hover:bg-primary-600 hover:shadow-md hover:shadow-neutral-200 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              {isCheckoutLoading ? "Memproses..." : "Bayar Sekarang"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
}
