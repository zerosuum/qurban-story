import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-white text-primary-900 text-center min-h-82.25 px-30 py-6 flex flex-col gap-4">
            <div className="flex flex-row items-start text-start justify-between">
                <div className="flex flex-col gap-3.5 max-w-60.75">
                    <img src="/brand.svg" alt="Qurban Story" />
                    <p>Platform qurban digital dengan transparasi pelaporan 3 tahap untuk ibadah yang amanah.</p>
                </div>
                <div className="flex flex-col px-4 py-1 gap-4">
                    <p className="font-bold">Navigasi</p>
                    <Link href="/">Beranda</Link>
                    <Link href="/">Produk</Link>
                    <Link href="/">Masuk</Link>
                </div>
                <div className="flex flex-col px-4 py-1 gap-4">
                    <p className="font-bold">Layanan Qurban</p>
                    <Link href="/">Kambing</Link>
                    <Link href="/">Domba</Link>
                    <Link href="/">Sapi 1 Ekor</Link>
                    <Link href="/">Sapi 1/7 Patungan</Link>
                </div>
                <div className="flex flex-col px-4 py-1 gap-4">
                    <p className="font-bold">Kontak</p>
                    <div className="flex flex-row gap-2">
                        <img src="/icons/phone.svg" alt="" />
                        <Link href="/">+62 812-3456-7890</Link>
                    </div>
                    <div className="flex flex-row gap-2">
                        <img src="/icons/whatsapp.svg" alt="" />
                        <Link href="/">WhatsApp</Link>
                    </div>
                    <div className="flex flex-row gap-2">
                        <img src="/icons/mail.svg" alt="" />
                        <Link href="/">info@qurbanstory.id</Link>
                    </div>
                </div>
            </div>
            <div className="bg-secondary-200 h-px"></div>
            <div className="text-sm text-muted-foreground mt-4">
                <p className="text-lg"> &copy; {new Date().getFullYear()} Qurban Story. Seluruh hak cipta dilindungi. </p>
            </div>
        </footer>
    );
}