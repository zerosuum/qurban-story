"use client";

import React from "react";
import ProductCard from "@/components/ui/ProductCard";

export default function ProdukPage() {
  const products = [
    {
      id: "kambing-premium",
      image: "/hewan/kambing.png",
      name: "Kambing Premium",
      originalPrice: "Rp. 3.600.000",
      currentPrice: "Rp. 3.200.000",
      weight: "25-35 kg",
    },
    {
      id: "sapi-limosin-patungan",
      image: "/hewan/sapi.png",
      name: "Sapi Limosin (Patungan)",
      originalPrice: "Rp. 4.200.000",
      currentPrice: "Rp. 4.000.000",
      weight: "350-400 kg",
      quota: { current: 2, max: 7 },
    },
    {
      id: "domba-pilihan",
      image: "/hewan/domba.png",
      name: "Domba Pilihan",
      originalPrice: "Rp. 3.200.000",
      currentPrice: "Rp. 2.800.000",
      weight: "30-35 kg",
    },
    {
      id: "sapi-brahmana",
      image: "/hewan/sapi.png",
      name: "Sapi Brahmana",
      originalPrice: "Rp. 27.000.000",
      currentPrice: "Rp. 25.000.000",
      weight: "300-350 kg",
    },
    {
      id: "sapi-limosin",
      image: "/hewan/sapi.png",
      name: "Sapi Limosin",
      currentPrice: "Rp. 28.000.000",
      weight: "350-400 kg",
    },
    {
      id: "sapi-brahmana-patungan",
      image: "/hewan/sapi.png",
      name: "Sapi Brahmana (Patungan)",
      originalPrice: "Rp. 3.800.000",
      currentPrice: "Rp. 3.600.000",
      weight: "300-350 kg",
      quota: { current: 0, max: 7 },
    },
    {
      id: "kambing-super",
      image: "/hewan/kambing.png",
      name: "Kambing Super",
      currentPrice: "Rp. 4.200.000",
      weight: "30-35 kg",
    },
    {
      id: "domba-super",
      image: "/hewan/domba.png",
      name: "Domba Super",
      currentPrice: "Rp. 4.500.000",
      weight: "35-40 kg",
    },
  ];

  return (
    <div className="w-full bg-white flex flex-col items-center pb-24">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              image={product.image}
              name={product.name}
              originalPrice={product.originalPrice}
              currentPrice={product.currentPrice}
              weight={product.weight}
              quota={product.quota}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
