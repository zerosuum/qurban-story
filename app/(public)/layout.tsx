import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-800">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}