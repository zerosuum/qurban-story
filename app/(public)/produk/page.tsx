"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";

type ProductApiResponse = {
  id: string;
  name: string;
  weight: string | null;
  price: string;
  promoPrice: string | null;
  images: { imageUrl: string; isPrimary: boolean }[];
  isActive?: boolean;
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
        });
        if (!res.ok) throw new Error("Gagal fetch produk");
        const json = await res.json();
        setProducts(json.data || []);
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
    <div className="w-full bg-white flex flex-col items-center pb-24 min-h-[calc(100vh-80px)]">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-6 py-[60px] px-6 w-full text-center">
        <h1 className="font-sans text-[36px] font-semibold leading-[46px] text-[#022D34]">
          Pilihan Hewan Qurban
        </h1>
        <p className="font-sans text-[20px] font-medium leading-[26px] text-[#022D34]">
          Berbagai pilihan hewan berkualitas sesuai kebutuhan Anda.
        </p>
      </div>

      {/* Grid Produk */}
      <div className="w-full max-w-[1200px] px-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {products.map((product) => {
              const primaryImage =
                product.images.find((img) => img.isPrimary)?.imageUrl ||
                product.images[0]?.imageUrl ||
                "/hewan/sapi.png"; // Fallback image

              const isPatungan = product.name
                .toLowerCase()
                .includes("patungan");

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
                  quota={isPatungan ? { current: 0, max: 7 } : undefined} // Mock quota sementara krn Zayyan blm pass AnimalGroup di API product
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
