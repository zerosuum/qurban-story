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
} from "@/components/ui/CheckoutCards";
import CancelModal from "@/components/ui/CancelModal";

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

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");

  // 🔥 FIX 1: State dirubah jadi Array biar bisa nampung 1 sampai 7 orang
  const [qurbanNames, setQurbanNames] = useState<string[]>([""]);

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

  useEffect(() => {
    if (session?.user?.name) {
      setDonorName(session.user.name);
    }
  }, [session]);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // 🔥 Logika Penentuan Maksimal Input Nama
  const productNameLower = product?.name.toLowerCase() || "";
  const isPatungan = productNameLower.includes("patungan");
  const isSapi = productNameLower.includes("sapi");
  const maxNames = !isPatungan && isSapi ? 7 : 1;
  const validNames = qurbanNames.filter((n) => n.trim() !== "");

  let displayNames = donorName || "Hamba Allah";
  if (validNames.length === 1) {
    displayNames = validNames[0];
  } else if (validNames.length === 2) {
    displayNames = `${validNames[0]} dan ${validNames[1]}`;
  } else if (validNames.length > 2) {
    const last = validNames[validNames.length - 1];
    const rest = validNames.slice(0, -1).join(", ");
    displayNames = `${rest}, dan ${last}`;
  }

  const handleNameChange = (index: number, val: string) => {
    const newNames = [...qurbanNames];
    newNames[index] = val;
    setQurbanNames(newNames);
  };

  const addNameInput = () => {
    if (qurbanNames.length < maxNames) {
      setQurbanNames([...qurbanNames, ""]);
    }
  };

  const removeNameInput = (index: number) => {
    const newNames = qurbanNames.filter((_, i) => i !== index);
    setQurbanNames(newNames);
  };

  const handleCheckout = async () => {
    if (!donorName || !donorPhone) {
      alert("Mohon lengkapi Nama Pequrban dan Nomor Telepon.");
      return;
    }

    const finalParticipants = validNames.length > 0 ? validNames : [donorName];

    setIsCheckoutLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          donorName: donorName,
          donorPhone: donorPhone,
          participants: finalParticipants,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memproses checkout");
      }

      window.snap.pay(data.token, {
        onSuccess: function () {
          router.push(`/invoice/${data.orderId}`);
        },
        onPending: function () {
          router.push(`/invoice/${data.orderId}`);
        },
        onError: function () {
          router.push(`/invoice/${data.orderId}`);
        },
        onClose: function () {
          router.push(`/invoice/${data.orderId}`);
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

  if (isProductLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] w-full flex justify-center items-center">
        <span className="text-neutral-500 font-medium">
          Menyiapkan halaman checkout...
        </span>
      </div>
    );
  }

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

  const mainImage =
    product.images.find((img) => img.isPrimary)?.imageUrl ||
    product.images[0]?.imageUrl ||
    "/hewan/sapi.png";
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

        {/* 2. CARD: DATA DONATUR */}
        <div className="flex flex-col items-start w-full p-4 px-6 gap-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
          <h2 className="font-sans text-[18px] font-bold text-neutral-900 w-full">
            Data Pequrban / Pembeli
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

        {/* 3. CARD: INPUT NAMA YANG BERQURBAN */}
        <div className="flex flex-col items-start w-full p-4 px-6 gap-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex justify-between items-center w-full">
            <h2 className="font-sans text-[18px] font-bold text-neutral-900">
              Nama yang Berqurban
            </h2>
            {maxNames > 1 && (
              <span className="text-[14px] font-medium text-[#044B57] bg-[#e6f3f5] px-3 py-1 rounded-full">
                {qurbanNames.length} / {maxNames} Orang
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full">
            {qurbanNames.map((name, index) => (
              <div key={index} className="flex flex-col gap-1 w-full">
                <label className="font-sans text-[14px] font-medium text-neutral-900">
                  {maxNames > 1
                    ? `Niat qurban atas nama (Orang ke-${index + 1})`
                    : `Niat qurban atas nama`}
                </label>
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder={donorName || "Masukkan nama yang berqurban"}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[14px] text-neutral-900 outline-none focus:border-primary-500"
                  />
                  {maxNames > 1 && qurbanNames.length > 1 && (
                    <button
                      onClick={() => removeNameInput(index)}
                      className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 transition-colors"
                      title="Hapus Nama"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {maxNames > 1 && qurbanNames.length < maxNames && (
              <button
                onClick={addNameInput}
                className="w-max px-4 py-2 mt-2 rounded-lg border border-[#044B57] text-[#044B57] text-sm font-semibold hover:bg-neutral-50 transition-colors"
              >
                + Tambah Nama Pequrban
              </button>
            )}
          </div>
        </div>

        {/* 4. CARD: CATATAN NIAT */}
        <CheckoutNiat nama={displayNames} />

        {/* 5. CARD: METODE PEMBAYARAN */}
        <CheckoutMetode />

        {/* 6. BOTTOM SECTION: TOTAL & BUTTONS */}
        <div className="flex flex-col gap-4 mt-2">
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

      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
}
