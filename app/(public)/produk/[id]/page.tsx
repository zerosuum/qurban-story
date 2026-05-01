"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type ProductDetailResponse = {
  id: string;
  name: string;
  description: string | null;
  weight: string | null;
  price: string;
  promoPrice: string | null;
  stock: number;
  images: { imageUrl: string; isPrimary: boolean }[];
  animalGroups?: { currentSlot: number; maxSlot: number; status: string }[];
};

function formatRupiah(value: string | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value));
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/products/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Gagal fetch detail produk");
        const json = await res.json();
        setProduct(json.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] w-full flex justify-center items-center">
        <span className="text-neutral-500 font-medium">
          Memuat detail produk...
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

  const isPatungan = product.name.toLowerCase().includes("patungan");

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.imageUrl ||
    product.images[0]?.imageUrl ||
    "/hewan/sapi.png";

  const displayImage = selectedImage || primaryImage;

  const allImages =
    product.images.length > 0
      ? product.images.map((img) => img.imageUrl)
      : ["/hewan/sapi.png"];

  const activeGroup =
    product.animalGroups?.find((g) => g.status === "OPEN") ||
    product.animalGroups?.[0];
  const currentSlot = activeGroup?.currentSlot || 0;
  const maxSlot = activeGroup?.maxSlot || 7;
  const progressPercentage = Math.min((currentSlot / maxSlot) * 100, 100);

  const isOutOfStock = product.stock <= 0;
  const isGroupFull = isPatungan && currentSlot >= maxSlot;
  const isDisabled = isOutOfStock || isGroupFull;

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-white flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-[1200px] flex flex-col gap-8">
        {/* Navigasi Kembali */}
        <Link
          href="/produk"
          className="flex items-center gap-2 w-full px-0 pt-6 pb-2 text-primary-600 font-bold text-[16px] leading-6 hover:opacity-80"
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

        {/* Hero Section Produk */}
        <div className="flex flex-col md:flex-row items-start gap-8 w-full">
          {/* Kiri: Gallery Foto */}
          <div className="flex flex-col gap-4 shrink-0 w-full md:w-auto">
            <div className="relative w-full md:w-[384px] h-[384px] rounded-xl bg-[#F3F3F3] overflow-hidden transition-all duration-300">
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-[90px] h-[96px] shrink-0 rounded-xl bg-[#F3F3F3] overflow-hidden cursor-pointer hover:opacity-80 transition-all ${
                    displayImage === img
                      ? "border-[3px] border-[#044B57]"
                      : "border border-transparent"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Kanan: Info & Action */}
          <div className="flex flex-col items-start w-full gap-4 pt-2">
            <h1 className="font-sans text-[28px] font-bold leading-[38px] text-neutral-900">
              {product.name}
            </h1>

            <div className="flex items-end gap-3">
              {product.promoPrice && (
                <span className="font-sans text-[28px] italic font-normal leading-[38px] text-[#8A6729] line-through">
                  {formatRupiah(product.price)}
                </span>
              )}
              <span className="font-sans text-[28px] font-bold leading-[38px] text-[#044B57]">
                {formatRupiah(product.promoPrice || product.price)}
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <p className="font-sans text-[18px] font-normal leading-[27px] text-[#022D34]">
                Berat: {product.weight || "Tidak spesifik"}
              </p>
              <p className="font-sans text-[18px] font-normal leading-[27px] text-[#022D34]">
                Stok: {product.stock}
              </p>
            </div>

            {/* Box Kuota Terisi */}
            {isPatungan && (
              <div className="flex flex-col items-start w-full p-6 gap-1 rounded-xl border border-[#F3F3F3] bg-[#FDFDF8] mt-2 mb-2">
                <div className="flex justify-between w-full">
                  <span className="font-sans text-[12px] font-semibold leading-[18px] text-neutral-900">
                    kuota terisi
                  </span>
                  <span className="font-sans text-[12px] font-semibold leading-[18px] text-neutral-900">
                    {currentSlot}/{maxSlot}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#F3F3F3] rounded-full overflow-hidden flex mt-1">
                  <div
                    className="h-full bg-[#033C46] transition-all duration-500 rounded-r-none"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* 🔥 TOMBOL BELI (DIUBAH JADI DINAMIS) */}
            {isDisabled ? (
              <button
                disabled
                className="flex justify-center items-center h-10 px-6 py-2 mt-4 gap-2.5 rounded-xl bg-neutral-300 text-white font-sans font-bold text-[16px] leading-[24px] cursor-not-allowed w-max"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                {isOutOfStock ? "Stok Habis" : "Kuota Penuh"}
              </button>
            ) : (
              <Link
                href={`/checkout/${product.id}`}
                className="flex justify-center items-center h-10 px-6 py-2 mt-4 gap-2.5 rounded-xl bg-[#044B57] text-white font-sans font-bold text-[16px] leading-[24px] hover:bg-[#033C46] active:scale-95 transition-all w-max"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="20"
                  viewBox="0 0 16 20"
                  fill="none"
                >
                  <path
                    d="M2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V6C0 5.45 0.195833 4.97917 0.5875 4.5875C0.979167 4.19583 1.45 4 2 4H4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4H14C14.55 4 15.0208 4.19583 15.4125 4.5875C15.8042 4.97917 16 5.45 16 6V18C16 18.55 15.8042 19.0208 15.4125 19.4125C15.0208 19.8042 14.55 20 14 20H2ZM2 18H14V6H12V8C12 8.28333 11.9042 8.52083 11.7125 8.7125C11.5208 8.90417 11.2833 9 11 9C10.7167 9 10.4792 8.90417 10.2875 8.7125C10.0958 8.52083 10 8.28333 10 8V6H6V8C6 8.28333 5.90417 8.52083 5.7125 8.7125C5.52083 8.90417 5.28333 9 5 9C4.71667 9 4.47917 8.90417 4.2875 8.7125C4.09583 8.52083 4 8.28333 4 8V6H2V18ZM6 4H10C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4Z"
                    fill="white"
                  />
                </svg>
                Beli Sekarang
              </Link>
            )}
          </div>
        </div>

        {/* Bawah: Deskripsi */}
        <div className="w-full max-w-[792px] mt-8">
          <p className="font-sans text-[16px] font-medium leading-[24px] text-[#022D34] whitespace-pre-wrap">
            <span className="font-bold">Deskripsi:</span>
            {"\n"}
            {product.description || "Tidak ada deskripsi."}
          </p>
        </div>
      </div>
    </div>
  );
}
