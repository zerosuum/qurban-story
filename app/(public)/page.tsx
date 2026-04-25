import Button from "@/components/ui/Button";
import KeunggulanCard from "@/components/ui/KeunggulanCard";
import Link from "next/link";
import AlurCard from "@/components/ui/AlurCard";
import PilihanHewanCard from "@/components/ui/PilihanHewanCard";
import { listProducts } from "@/lib/products/product.service";
import { Suspense } from "react";

type PilihanHewanItem = {
  id: string;
  name: string;
  image: string;
  price: string;
  weight: string;
};

function formatRupiah(value: string | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value));
}

export default function Home() {
  return (
    <main>
      <div className="min-h-[calc(100vh-80px)] flex items-end justify-start px-4 sm:px-8 lg:px-10 py-12 sm:py-16 lg:py-20 bg-cover bg-center" style={{ backgroundImage: "url('landing-page.png')" }}>
        <div className="text-white flex text-start flex-col max-w-2xl gap-4 sm:gap-6">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold leading-tight">Qurban Lebih Mudah dan Terpercaya</h2>
          <p className="text-base sm:text-xl lg:text-2xl">Qurban Story telah berpengalaman lebih dari 10 tahun dalam pengelolaan dan penyaluran hewan qurban.</p>
          <Link href="/produk" className="w-max">
            <Button variant="secondary">Lihat Produk</Button>
          </Link>
        </div>
      </div>
      <div className="bg-secondary flex flex-col items-center justify-center gap-4 sm:gap-6 px-4 sm:px-8 lg:px-10 py-14 sm:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Tentang Kami</h2>
        <p className="max-w-5xl text-base sm:text-lg lg:text-xl font-medium">Qurban Story bergerak di bidang peternakan dan pengelolaan qurban. Dengan pengalaman lebih dari satu dekade, kami telah melayani ribuan pelanggan di berbagai daerah. Kami berfokus pada kemudahan transaksi dan pelaporan yang jelas, sehingga setiap pequrban dapat memantau proses pelaksanaan qurban dengan tenang dan percaya.</p>
      </div>
      <div className="bg-primary flex flex-col items-center justify-center gap-8 px-4 sm:px-8 lg:px-10 py-14 sm:py-20 text-center">
        <div className="text-white flex w-full max-w-7xl flex-col items-center gap-4 sm:gap-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Keunggulan Qurban Story</h2>
          <p className="max-w-5xl text-base sm:text-lg lg:text-xl font-medium">Alasan pelanggan memercayakan qurban mereka kepada kami.</p>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:gap-6 lg:gap-8">
            <KeunggulanCard
              icon={<img src="/icons/workspace_premium.svg" alt="Medali" />}
              title="Pengalaman Lebih dari 10 Tahun"
              description="Telah dipercaya ribuan pelanggan dalam pengelolaan dan penyaluran hewan qurban."
            />
            <KeunggulanCard
              icon={<img src="/icons/shopping_cart.svg" alt="Keranjang Belanja" />}
              title="Proses Pembelian Mudah"
              description="Pilih hewan qurban, bayar, dengan aman, dan selesai.
Tanpa proses yang rumit."
            />
            <KeunggulanCard
              icon={<img src="/icons/assignment.svg" alt="Assignment" />}
              title="Laporan Pelaksanaan Jelas"
              description="Dapatkan laporan lengkap berupa foto, video dan catatan distribusi qurban Anda."
            />
            <KeunggulanCard
              icon={<img src="/icons/support_agent.svg" alt="Assignment" />}
              title="Tim yang Responsif"
              description="Tim kami siap membantu Anda kapan saja melalui telepon, WhatsApp, atau email."
            />
          </div>
        </div>
      </div>
      <div className="bg-secondary flex flex-col items-center justify-center gap-8 px-4 sm:px-8 lg:px-10 py-14 sm:py-20 text-center">
        <div className="text-black flex flex-col items-center gap-3 sm:gap-4 lg:gap-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Alur Pembelian Qurban</h2>
          <h4 className="text-base sm:text-lg lg:text-xl font-medium">Tiga langkah sederhana untuk menunaikan qurban bersama Qurban Story</h4>
        </div>
        <div className="grid w-full max-w-6xl grid-cols-1 justify-items-center gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          <AlurCard number="01" title="Pilih Hewan Qurban" description="Pilih hewan qurban yang Anda inginkan dari berbagai pilihan yang tersedia." />
          <AlurCard number="02" title="Lakukan Pembayaran" description="Lakukan pembayaran secara aman melalui berbagai metode yang tersedia." />
          <AlurCard number="03" title="Dapatkan Laporan" description="Dapatkan laporan lengkap berupa foto, video, dan catatan distribusi qurban Anda." />
        </div>
      </div>
      <div className="bg-primary flex flex-col justify-center items-center gap-8 px-4 sm:px-6 lg:px-10 py-14 sm:py-16">
        <div className="text-white flex flex-col items-center gap-3 sm:gap-4 lg:gap-6 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Pilihan Hewan Qurban</h2>
          <h4 className="text-base sm:text-lg lg:text-xl font-medium">Berbagai pilihan hewan berkualitas sesuai kebutuhan Anda.</h4>
        </div>
        <Suspense fallback={<PilihanHewanSkeleton />}>
          <PilihanHewanGrid />
        </Suspense>
      </div>
      <div className="bg-secondary flex flex-col justify-center items-center text-center gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-8 lg:px-30 py-14 sm:py-20">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold max-w-4xl">Siap Menunaikan Qurban dengan Lebih Tenang?</h2>
        <h4 className="text-base sm:text-lg lg:text-xl font-medium max-w-4xl">Percayakan Qurban Anda kepada Kami. Proses mudah, laporan jelas.</h4>
        <Link href="/produk">
          <Button>Lihat Produk Qurban</Button>
        </Link>
      </div>
    </main>
  );
}

async function PilihanHewanGrid() {
  let pilihanHewan: PilihanHewanItem[] = [];

  try {
    const firstPage = await listProducts({
      page: 1,
      pageSize: 100,
      isActive: true,
    });

    const allProducts = [...firstPage.data];

    if (firstPage.pagination.totalPages > 1) {
      for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
        const nextPage = await listProducts({
          page,
          pageSize: 100,
          isActive: true,
        });
        allProducts.push(...nextPage.data);
      }
    }

    pilihanHewan = allProducts.map((product) => ({
      id: product.id,
      name: product.name,
      image:
        product.images.find(
          (img: { isPrimary: boolean; imageUrl: string }) => img.isPrimary,
        )?.imageUrl ||
        product.images[0]?.imageUrl ||
        "/hewan/sapi.png",
      price: formatRupiah(product.promoPrice || product.price),
      weight: product.weight
        ? `Berat: ${product.weight}`
        : "Berat: Tidak spesifik",
    }));
  } catch (error) {
    console.error("[HOME_PRODUCTS_FETCH_ERROR]", error);
  }

  if (pilihanHewan.length === 0) {
    return (
      <p className="text-white/90 text-lg font-medium">
        Produk belum tersedia saat ini.
      </p>
    );
  }

  return (
    <div className="grid w-full max-w-6xl grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {pilihanHewan.map((item) => (
        <PilihanHewanCard
          key={item.id}
          image={item.image}
          name={item.name}
          price={item.price}
          weight={item.weight}
          href={`/produk/${item.id}`}
        />
      ))}
    </div>
  );
}

function PilihanHewanSkeleton() {
  return (
    <div className="grid w-full max-w-6xl grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="w-full max-w-70 rounded-lg bg-white p-6 shadow-md skeleton-shimmer"
        >
          <div className="mx-auto aspect-square w-full max-w-58 rounded-lg bg-neutral-100 skeleton-shimmer" />
          <div className="mt-4 space-y-3">
            <div className="h-5 w-4/5 mx-auto rounded bg-neutral-100 skeleton-shimmer" />
            <div className="h-5 w-3/5 mx-auto rounded bg-neutral-100 skeleton-shimmer" />
            <div className="h-4 w-2/3 mx-auto rounded bg-neutral-100 skeleton-shimmer" />
            <div className="h-10 w-full rounded-xl bg-neutral-100 skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
