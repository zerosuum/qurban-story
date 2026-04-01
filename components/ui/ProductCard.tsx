import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  id: string;
  image: string;
  name: string;
  originalPrice?: string; // harga promo
  currentPrice: string;
  weight: string;
  quota?: { current: number; max: number }; // patungan
};

export default function ProductCard({
  id,
  image,
  name,
  originalPrice,
  currentPrice,
  weight,
  quota,
}: ProductCardProps) {
  const progressPercentage = quota ? (quota.current / quota.max) * 100 : 0;

  return (
    <div className="flex flex-col w-[280px] h-[464px] rounded-xl border border-neutral-200 bg-white shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)] overflow-hidden hover:shadow-md transition-shadow">
      {/* Bagian Gambar */}
      <div className="relative w-full h-[232px] bg-[#F3F3F3] shrink-0">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="280px"
        />
      </div>

      {/* Bagian Info Produk */}
      <div className="flex flex-col p-6 w-full h-full justify-between items-start">
        {/* Kumpulan Teks */}
        <div className="flex flex-col w-full items-start gap-1">
          {/* Nama Hewan */}
          <h3 className="font-sans text-[16px] font-semibold leading-[24px] text-neutral-900 w-full line-clamp-1 text-left">
            {name}
          </h3>

          {/* Harga */}
          <div className="flex flex-wrap items-center gap-2 w-full mb-2">
            {originalPrice && (
              <span className="font-sans text-[16px] italic font-normal leading-[20px] text-[#8A6729] line-through whitespace-nowrap">
                {originalPrice}
              </span>
            )}
            <span className="font-sans text-[16px] font-bold leading-[20px] text-[#044B57] whitespace-nowrap">
              {currentPrice}
            </span>
          </div>

          {/* Berat */}
          <p className="font-sans text-[16px] font-normal leading-[24px] text-neutral-900 mt-1">
            Berat: {weight}
          </p>
        </div>

        {/* Spacer khusus jika tdk ada quota, agar tombol tetap di bawah */}
        {!quota && <div className="flex-grow" />}

        {/* Progress Bar Quota (Khusus Patungan) */}
        {quota && (
          <div className="flex flex-col items-start w-full gap-1 mt-auto mb-4">
            <div className="flex justify-between w-full">
              <span className="font-sans text-[12px] font-semibold leading-[18px] text-neutral-900">
                kuota terisi
              </span>
              <span className="font-sans text-[12px] font-semibold leading-[18px] text-neutral-900">
                {quota.current}/{quota.max}
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#F3F3F3] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[#033C46] transition-all duration-500 rounded-r-none"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Tombol CTA */}
        <Link
          href={`/produk/${id}`}
          className="flex justify-center items-center w-full h-10 px-4 py-2 mt-auto rounded-xl bg-[#044B57] text-white font-sans font-bold text-[16px] leading-[24px] hover:bg-[#033C46] active:scale-95 transition-all"
        >
          Lihat detail
        </Link>
      </div>
    </div>
  );
}
