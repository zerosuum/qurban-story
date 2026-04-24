import Button from "@/components/ui/Button";
import KeunggulanCard from "@/components/ui/KeunggulanCard";
import Link from "next/link";
import AlurCard from "@/components/ui/AlurCard";
import PilihanHewanCard from "@/components/ui/PilihanHewanCard";
import { listProducts } from "@/lib/products/product.service";

function formatRupiah(value: string | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value));
}

export default async function Home() {
  let pilihanHewan: Array<{
    id: string;
    name: string;
    image: string;
    price: string;
    weight: string;
  }> = [];

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

  return (
    <main>
      <div className="min-h-[calc(100vh-80px)] flex items-end justify-start px-10 py-20 bg-cover bg-center" style={{ backgroundImage: "url('landing-page.png')" }}>
        <div className="text-white flex text-start flex-col max-w-200 gap-6">
          <h2 className="text-[44px] font-bold">Qurban Lebih Mudah dan Terpercaya</h2>
          <p className="text-2xl">Qurban Story telah berpengalaman lebih dari 10 tahun dalam pengelolaan dan penyaluran hewan qurban.</p>
          <Link href="/produk" className="w-max">
            <Button variant="secondary">Lihat Produk</Button>
          </Link>
        </div>
      </div>
      <div className="min-h-103.5 bg-secondary flex flex-col items-center justify-center gap-6 px-10 py-20 text-center">
        <h2 className="text-4xl font-semibold">Tentang Kami</h2>
        <p className="max-w-249 text-xl fs font-medium">Qurban Story bergerak di bidang peternakan dan pengelolaan qurban. Dengan pengalaman lebih dari satu dekade, kami telah melayani ribuan pelanggan di berbagai daerah. Kami berfokus pada kemudahan transaksi dan pelaporan yang jelas, sehingga setiap pequrban dapat memantau proses pelaksanaan qurban dengan tenang dan percaya.</p>
      </div>
      <div className="min-h-103.5 bg-primary flex flex-col items-center justify-center gap-8 px-10 py-20 text-center">
        <div className="text-white flex flex-col items-center gap-6">
          <h2 className="text-4xl font-semibold">Keunggulan Qurban Story</h2>
          <p className="max-w-249 text-xl fs font-medium">Alasan pelanggan memercayakan qurban mereka kepada kami.</p>
          <div className="flex w-full gap-8 px-30 ">
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
      <div className="min-h-142 bg-secondary flex flex-col items-center justify-center gap-8 px-10 py-20 text-center">
        <div className="text-black flex flex-col items-center gap-6">
          <h2 className="text-4xl font-semibold">Alur Pembelian Qurban</h2>
          <h4 className="text-xl font-medium">Tiga langkah sederhana untuk menunaikan qurban bersama Qurban Story</h4>
        </div>
        <div className="flex flex-row gap-15">
          <AlurCard number="01" title="Pilih Hewan Qurban" description="Pilih hewan qurban yang Anda inginkan dari berbagai pilihan yang tersedia." />
          <AlurCard number="02" title="Lakukan Pembayaran" description="Lakukan pembayaran secara aman melalui berbagai metode yang tersedia." />
          <AlurCard number="03" title="Dapatkan Laporan" description="Dapatkan laporan lengkap berupa foto, video, dan catatan distribusi qurban Anda." />
        </div>
      </div>
      <div className="min-h-198 bg-primary flex flex-col justify-center items-center gap-8 px-6 py-16">
        <div className="text-white flex flex-col items-center gap-6">
          <h2 className="text-4xl font-semibold">Pilihan Hewan Qurban</h2>
          <h4 className="text-xl font-medium">Berbagai pilihan hewan berkualitas sesuai kebutuhan Anda.</h4>
        </div>
        {pilihanHewan.length === 0 ? (
          <p className="text-white/90 text-lg font-medium">Produk belum tersedia saat ini.</p>
        ) : (
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
        )}
      </div>
      <div className="min-h-100 bg-secondary flex flex-col justify-center items-center text-center gap-8 px-30 py-45">
        <h2 className="text-4xl font-semibold">Siap Menunaikan Qurban dengan Lebih Tenang?</h2>
        <h4 className="text-xl font-medium">Percayakan Qurban Anda kepada Kami. Proses mudah, laporan jelas.</h4>
        <Link href="/produk">
          <Button>Lihat Produk Qurban</Button>
        </Link>
      </div>
    </main>
  );
}
