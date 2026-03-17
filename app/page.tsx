import Button from "@/components/ui/Button";
import KeunggulanCard from "@/components/ui/KeunggulanCard";
import Link from "next/dist/client/link";
import AlurCard from "@/components/ui/AlurCard";
import PilihanHewanCard from "@/components/ui/PilihanHewanCard";

export default function Home() {
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
      <div className="min-h-198 bg-primary flex flex-col justify-center items-center gap-8">
        <div className="text-white flex flex-col items-center gap-6">
          <h2 className="text-4xl font-semibold">Pilihan Hewan Qurban</h2>
          <h4 className="text-xl font-medium">Berbagai pilihan hewan berkualitas sesuai kebutuhan Anda.</h4>
        </div>
        <div className="flex flex-row gap-6">
          <PilihanHewanCard image="/hewan/domba.png" name="Domba" price="Rp 3.500.000" weight="Berat: 30-40 kg" />
          <PilihanHewanCard image="/hewan/kambing.png" name="Kambing" price="Rp 3.200.000" weight="Berat: 25-35 kg" />
          <PilihanHewanCard image="/hewan/sapi.png" name="Sapi 1 Ekor" price="Rp 28.000.000" weight="Berat: 300 kg" />
          <PilihanHewanCard image="/hewan/sapi.png" name="Sapi 1/7 Patungan" price="Rp 4.200.000" weight="Berat: 300 kg / 7" />
        </div>
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
