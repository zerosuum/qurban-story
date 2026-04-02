import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white text-neutral-800">
            <Navbar />
            <main className="min-h-[calc(100vh-80px)]">{children}</main>
            <Footer />
        </div>
    );
}
