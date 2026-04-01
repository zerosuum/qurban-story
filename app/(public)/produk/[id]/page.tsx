"use client";

import Link from "next/link";
import Image from "next/image";
// import { useParams } from "next/navigation";

type ProductDetail = {
  name: string;
  originalPrice?: string;
  currentPrice: string;
  weight: string;
  stock: number;
  images: string[];
  description: string;
  quota?: { current: number; max: number };
};

export default function ProductDetailPage() {
  // const params = useParams();

  const product: ProductDetail = {
    name: "Sapi Limosin (Patungan)",
    originalPrice: "Rp. 4.200.000",
    currentPrice: "Rp. 4.000.000",
    weight: "350-400 kg",
    stock: 5,
    images: ["/hewan/sapi.png", "/hewan/sapi.png", "/hewan/sapi.png"],
    description: `Tentang kami\nQurban Story bergerak di bidang peternakan dan pengelolaan qurban. Dengan pengalaman lebih dari satu dekade, kami telah melayani ribuan pelanggan di berbagai daerah. Kami berfokus pada kemudahan transaksi dan pelaporan yang jelas, sehingga setiap pequrban dapat memantau proses pelaksanaan qurban dengan tenang dan percaya.\n\nKeunggulan Qurban Story\n1. Pengalaman lebih dari 10 tahun\n2. Proses pembelian mudah\n3. Laporan pelaksanaan jelas\n4. Tim yang responsif\n\nAlur pembelian qurban\n1. Pilih produk qurban\n2. Lakukan pembayaran\n3. Terima laporan pelaksanaan`,
    quota: { current: 2, max: 7 },
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-white flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-[1200px] flex flex-col gap-8">
        {/* Navigasi Kembali */}
        <Link
          href="/produk"
          className="flex items-center gap-2 w-full px-0 pt-6 pb-2 text-primary-600 font-bold text-[16px] leading-6"
        >
          {/* ICON */}
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
          <div className="flex flex-col gap-4 shrink-0">
            <div className="relative w-full md:w-[384px] h-[384px] rounded-xl bg-[#F3F3F3] overflow-hidden">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-[90px] h-[96px] shrink-0 rounded-xl bg-[#F3F3F3] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              <div className="flex justify-center items-center w-[90px] h-[96px] shrink-0 rounded-xl bg-[#F3F3F3] opacity-50 cursor-not-allowed">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            </div>
          </div>

          {/* Kanan: Info & Action */}
          <div className="flex flex-col items-start w-full gap-4 pt-2">
            <h1 className="font-sans text-[28px] font-bold leading-[38px] text-neutral-900">
              {product.name}
            </h1>

            <div className="flex items-end gap-3">
              {product.originalPrice && (
                <span className="font-sans text-[28px] italic font-normal leading-[38px] text-[#8A6729] line-through">
                  {product.originalPrice}
                </span>
              )}
              <span className="font-sans text-[28px] font-bold leading-[38px] text-[#044B57]">
                {product.currentPrice}
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <p className="font-sans text-[18px] font-normal leading-[27px] text-[#022D34]">
                Berat: {product.weight}
              </p>
              <p className="font-sans text-[18px] font-normal leading-[27px] text-[#022D34]">
                Stok: {product.stock}
              </p>
            </div>

            {/* Box Kuota Terisi */}
            {product.quota && (
              <div className="flex flex-col items-start w-full p-6 gap-1 rounded-xl border border-[#F3F3F3] bg-[#FDFDF8] mt-2 mb-2">
                <div className="flex justify-between w-full">
                  <span className="font-sans text-[12px] font-semibold leading-[18px] text-neutral-900">
                    kuota terisi
                  </span>
                  <span className="font-sans text-[12px] font-semibold leading-[18px] text-neutral-900">
                    {product.quota.current}/{product.quota.max}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#F3F3F3] rounded-full overflow-hidden flex mt-1">
                  <div
                    className="h-full bg-[#033C46] transition-all duration-500 rounded-r-none"
                    style={{
                      width: `${(product.quota.current / product.quota.max) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tombol Beli */}
            <Link
              href={`/checkout/inv-dummy`}
              className="flex justify-center items-center h-10 px-6 py-2 mt-4 gap-2.5 rounded-xl bg-[#044B57] text-white font-sans font-bold text-[16px] leading-[24px] hover:bg-[#033C46] active:scale-95 transition-all w-max"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <mask
                  id="mask0_cart"
                  style={{ maskType: "alpha" }}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="24"
                  height="24"
                >
                  <rect width="24" height="24" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_cart)">
                  <path
                    d="M5.5875 21.4125C5.19583 21.0208 5 20.55 5 20C5 19.45 5.19583 18.9792 5.5875 18.5875C5.97917 18.1958 6.45 18 7 18C7.55 18 8.02083 18.1958 8.4125 18.5875C8.80417 18.9792 9 19.45 9 20C9 20.55 8.80417 21.0208 8.4125 21.4125C8.02083 21.8042 7.55 22 7 22C6.45 22 5.97917 21.8042 5.5875 21.4125ZM15.5875 21.4125C15.1958 21.0208 15 20.55 15 20C15 19.45 15.1958 18.9792 15.5875 18.5875C15.9792 18.1958 16.45 18 17 18C17.55 18 18.0208 18.1958 18.4125 18.5875C18.8042 18.9792 19 19.45 19 20C19 20.55 18.8042 21.0208 18.4125 21.4125C18.0208 21.8042 17.55 22 17 22C16.45 22 15.9792 21.8042 15.5875 21.4125ZM6.15 6L8.55 11H15.55L18.3 6H6.15ZM5.2 4H19.95C20.3333 4 20.625 4.17083 20.825 4.5125C21.025 4.85417 21.0333 5.2 20.85 5.55L17.3 11.95C17.1167 12.2833 16.8708 12.5417 16.5625 12.725C16.2542 12.9083 15.9167 13 15.55 13H8.1L7 15H19V17H7C6.25 17 5.68333 16.6708 5.3 16.0125C4.91667 15.3542 4.9 14.7 5.25 14.05L6.6 11.6L3 4H1V2H4.25L5.2 4Z"
                    fill="white"
                  />
                </g>
              </svg>
              Beli Sekarang
            </Link>
          </div>
        </div>

        {/* Bawah: Deskripsi */}
        <div className="w-full max-w-[792px] mt-8">
          <p className="font-sans text-[16px] font-medium leading-[24px] text-[#022D34] whitespace-pre-wrap">
            <span className="font-bold">Deskripsi:</span>
            {"\n"}
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}
