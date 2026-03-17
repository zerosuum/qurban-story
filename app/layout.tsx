import type { Metadata } from "next";
import { Forum, Public_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
const forum = Forum({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-forum",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Qurban Story | Qurban Lebih Mudah dan Terpercaya",
  description:
    "Platform e-commerce digital dengan transparansi pelaporan 3 tahap untuk ibadah qurban yang amanah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${publicSans.className} ${forum.variable} ${publicSans.variable} antialiased bg-secondary-50 text-neutral-800`}
      >
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}