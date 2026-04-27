"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";

type ProductApiResponse = {
  id: string;
  name: string;
  weight: string | null;
  price: string;
  promoPrice: string | null;
  stock: number;
  images: { imageUrl: string; isPrimary: boolean }[];
  isActive?: boolean;
  animalGroups?: { currentSlot: number; maxSlot: number; status: string }[];
};

function formatRupiah(value: string | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value));
}

export default function ProdukPage() {
  const [products, setProducts] = useState<ProductApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

const fetchProducts = async () => {
  setIsLoading(true);
  setProducts([]);

  try {
    const res = await fetch("/api/products?pageSize=20&isActive=true", {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Gagal fetch produk");
    const json = await res.json();

    const fetchedProducts = json.data || [];

    fetchedProducts.sort((a: ProductApiResponse, b: ProductApiResponse) => {
      const aIsPatungan = a.name.toLowerCase().includes("patungan");
      const aGroup =
        a.animalGroups?.find((g) => g.status === "OPEN") || a.animalGroups?.[0];
      const aIsDisabled =
        a.stock <= 0 ||
        (aIsPatungan && (aGroup?.currentSlot || 0) >= (aGroup?.maxSlot || 7));

      const bIsPatungan = b.name.toLowerCase().includes("patungan");
      const bGroup =
        b.animalGroups?.find((g) => g.status === "OPEN") || b.animalGroups?.[0];
      const bIsDisabled =
        b.stock <= 0 ||
        (bIsPatungan && (bGroup?.currentSlot || 0) >= (bGroup?.maxSlot || 7));

      if (aIsDisabled && !bIsDisabled) return 1;
      if (!aIsDisabled && bIsDisabled) return -1;
      return 0;
    });

    setProducts(fetchedProducts);
  } catch (error) {
    if ((error as Error).name !== "AbortError") {
      console.error(error);
    }
  } finally {
    if (!controller.signal.aborted) {
      setIsLoading(false);
    }
  }
};

    void fetchProducts();

    return () => controller.abort();
  }, []);

  return (
    <div className="w-full bg-white flex flex-col items-center pb-16 md:pb-24 min-h-[calc(100vh-80px)]">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-4 md:gap-6 py-10 md:py-[60px] px-4 md:px-6 w-full text-center">
        <h1 className="font-sans text-[28px] md:text-[36px] font-semibold leading-[38px] md:leading-[46px] text-[#022D34]">
          Pilihan Hewan Qurban
        </h1>
        <p className="font-sans text-[16px] md:text-[20px] font-medium leading-[24px] md:leading-[26px] text-[#022D34]">
          Berbagai pilihan hewan berkualitas sesuai kebutuhan Anda.
        </p>
      </div>

      {/* Grid Produk */}
      <div className="w-full max-w-[1200px] px-4 md:px-6">
        {isLoading ? (
          <div className="w-full flex justify-center py-12">
            <span className="text-neutral-500 font-medium">
              Memuat katalog produk...
            </span>
          </div>
        ) : products.length === 0 ? (
          <div className="w-full flex justify-center py-12">
            <span className="text-neutral-500 font-medium">
              Belum ada produk yang tersedia.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 justify-items-center">
            {products.map((product) => {
              const primaryImage =
                product.images.find((img) => img.isPrimary)?.imageUrl ||
                product.images[0]?.imageUrl ||
                "/hewan/sapi.png";

              const isPatungan = product.name
                .toLowerCase()
                .includes("patungan");

              const activeGroup =
                product.animalGroups?.find((g) => g.status === "OPEN") ||
                product.animalGroups?.[0];

              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  image={primaryImage}
                  name={product.name}
                  originalPrice={
                    product.promoPrice ? formatRupiah(product.price) : undefined
                  }
                  currentPrice={formatRupiah(
                    product.promoPrice || product.price,
                  )}
                  weight={
                    product.weight
                      ? `${product.weight}`
                      : "Berat tidak spesifik"
                  }
                  // 🔥 FIX 1: Lempar data stok ke komponen ProductCard
                  stock={product.stock}
                  quota={
                    isPatungan
                      ? {
                          current: activeGroup?.currentSlot || 0,
                          max: activeGroup?.maxSlot || 7,
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
