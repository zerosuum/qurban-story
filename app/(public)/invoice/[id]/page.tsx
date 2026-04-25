"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type TransactionDetail = {
  id: string;
  invoice: string;
  nominal: string;
  tanggal: string;
  createdAt: string;
  snapToken: string | null;
  paymentMethod: string | null;
  pembayaran: string;
};

function formatRupiah(value: string | number) {
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

function formatPaymentMethod(type: string | null) {
  // 🔥 FIX 1: Ubah teks biar lebih make sense kalau user belum milih metode di Midtrans
  if (!type) return "Belum dipilih";

  const methods: Record<string, string> = {
    gopay: "GoPay",
    qris: "QRIS",
    shopeepay: "ShopeePay",
    bank_transfer: "Virtual Account",
    echannel: "Mandiri Bill",
    cstore: "Minimarket",
    credit_card: "Kartu Kredit",
  };

  return methods[type] || type.replace(/_/g, " ").toUpperCase();
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [detail, setDetail] = useState<TransactionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        const response = await fetch(`/api/transactions/${id}`);
        if (!response.ok) throw new Error("Gagal fetch invoice");
        const result = await response.json();
        setDetail(result.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const statusBayar =
    detail?.pembayaran === "TERTUNDA"
      ? "MENUNGGU PEMBAYARAN"
      : detail?.pembayaran;

  useEffect(() => {
    if (!detail?.createdAt || statusBayar !== "MENUNGGU PEMBAYARAN") return;

    const interval = setInterval(() => {
      const targetTime =
        new Date(detail.createdAt).getTime() + 24 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance < 0) {
        setTimeLeft("00:00:00");
        clearInterval(interval);
        // 🔥 FIX 2: Paksa update state 'detail' jadi KADALUARSA biar UI-nya langsung berubah otomatis!
        setDetail((prev) =>
          prev ? { ...prev, pembayaran: "KADALUARSA" } : prev,
        );
        return;
      }

      const h = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [detail, statusBayar]);

  const handlePayNow = async () => {
    if (!window.snap || !detail) {
      alert(
        "Sistem pembayaran sedang memuat. Silakan coba beberapa detik lagi.",
      );
      return;
    }

    setIsPaying(true);

    try {
      let snapToken = detail.snapToken;
      const shouldRefreshToken =
        !snapToken || statusBayar === "GAGAL" || statusBayar === "KADALUARSA";

      if (shouldRefreshToken) {
        const response = await fetch(
          `/api/transactions/${detail.id}/payment-token`,
          {
            method: "POST",
          },
        );

        const result = (await response.json().catch(() => null)) as {
          data?: { token?: string };
          message?: string;
        } | null;

        if (!response.ok) {
          throw new Error(
            result?.message || "Gagal menyiapkan ulang pembayaran.",
          );
        }

        const freshToken = result?.data?.token;

        if (!freshToken) {
          throw new Error(
            "Token pembayaran tidak ditemukan. Silakan coba lagi.",
          );
        }

        snapToken = freshToken;
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                snapToken: freshToken,
                pembayaran: "TERTUNDA",
              }
            : prev,
        );
      }

      if (!snapToken) {
        throw new Error("Token pembayaran tidak ditemukan. Silakan coba lagi.");
      }

      window.snap.pay(snapToken, {
        onSuccess: function () {
          window.location.reload();
        },
        onPending: function () {
          alert("Silakan selesaikan pembayaran Anda.");
        },
        onError: function () {
          window.location.reload();
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memproses pembayaran.";
      alert(message);
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex justify-center items-center text-neutral-500 font-medium">
        Memuat Invoice...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col gap-4 justify-center items-center text-neutral-500 font-medium">
        Invoice tidak ditemukan.
        <Link href="/riwayat-trx" className="text-primary-600 underline">
          Kembali ke Riwayat
        </Link>
      </div>
    );
  }

  let iconSvg;
  let badgeColor;
  let title;
  let description;

  if (statusBayar === "BERHASIL") {
    badgeColor = "bg-[#2D6A4F]";
    title = "Pembayaran Berhasil";
    description =
      "Pembayaran Qurban Anda telah berhasil diproses. Kami akan segera mempersiapkan hewan qurban Anda.";
    iconSvg = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        style={{ aspectRatio: "1/1" }}
      >
        <mask
          id="mask0_800_9967"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="96"
          height="96"
        >
          <rect width="96" height="96" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_800_9967)">
          <path
            d="M48 88C42.4667 88 37.2667 86.95 32.4 84.85C27.5333 82.75 23.3 79.9 19.7 76.3C16.1 72.7 13.25 68.4667 11.15 63.6C9.05 58.7333 8 53.5333 8 48C8 42.4667 9.05 37.2667 11.15 32.4C13.25 27.5333 16.1 23.3 19.7 19.7C23.3 16.1 27.5333 13.25 32.4 11.15C37.2667 9.05 42.4667 8 48 8C52.3333 8 56.4333 8.63333 60.3 9.9C64.1667 11.1667 67.7333 12.9333 71 15.2L65.2 21.1C62.6667 19.5 59.9667 18.25 57.1 17.35C54.2333 16.45 51.2 16 48 16C39.1333 16 31.5833 19.1167 25.35 25.35C19.1167 31.5833 16 39.1333 16 48C16 56.8667 19.1167 64.4167 25.35 70.65C31.5833 76.8833 39.1333 80 48 80C56.8667 80 64.4167 76.8833 70.65 70.65C76.8833 64.4167 80 56.8667 80 48C80 46.8 79.9333 45.6 79.8 44.4C79.6667 43.2 79.4667 42.0333 79.2 40.9L85.7 34.4C86.4333 36.5333 87 38.7333 87.4 41C87.8 43.2667 88 45.6 88 48C88 53.5333 86.95 58.7333 84.85 63.6C82.75 68.4667 79.9 72.7 76.3 76.3C72.7 79.9 68.4667 82.75 63.6 84.85C58.7333 86.95 53.5333 88 48 88ZM42.4 66.4L25.4 49.4L31 43.8L42.4 55.2L82.4 15.1L88 20.7L42.4 66.4Z"
            fill="#2D6A4F"
          />
        </g>
      </svg>
    );
  } else if (statusBayar === "GAGAL") {
    badgeColor = "bg-[#D32F2F]";
    title = "Pembayaran Gagal";
    description =
      "Mohon maaf, pembayaran Anda tidak dapat diproses. Silakan coba kembali atau gunakan metode pembayaran lain.";
    iconSvg = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        style={{ aspectRatio: "1/1" }}
      >
        <mask
          id="mask0_800_5637"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="96"
          height="96"
        >
          <rect width="96" height="96" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_800_5637)">
          <path
            d="M33.6 68L48 53.6L62.4 68L68 62.4L53.6 48L68 33.6L62.4 28L48 42.4L33.6 28L28 33.6L42.4 48L28 62.4L33.6 68ZM48 88C42.4667 88 37.2667 86.95 32.4 84.85C27.5333 82.75 23.3 79.9 19.7 76.3C16.1 72.7 13.25 68.4667 11.15 63.6C9.05 58.7333 8 53.5333 8 48C8 42.4667 9.05 37.2667 11.15 32.4C13.25 27.5333 16.1 23.3 19.7 19.7C23.3 16.1 27.5333 13.25 32.4 11.15C37.2667 9.05 42.4667 8 48 8C53.5333 8 58.7333 9.05 63.6 11.15C68.4667 13.25 72.7 16.1 76.3 19.7C79.9 23.3 82.75 27.5333 84.85 32.4C86.95 37.2667 88 42.4667 88 48C88 53.5333 86.95 58.7333 84.85 63.6C82.75 68.4667 79.9 72.7 76.3 76.3C72.7 79.9 68.4667 82.75 63.6 84.85C58.7333 86.95 53.5333 88 48 88ZM48 80C56.9333 80 64.5 76.9 70.7 70.7C76.9 64.5 80 56.9333 80 48C80 39.0667 76.9 31.5 70.7 25.3C64.5 19.1 56.9333 16 48 16C39.0667 16 31.5 19.1 25.3 25.3C19.1 31.5 16 39.0667 16 48C16 56.9333 19.1 64.5 25.3 70.7C31.5 76.9 39.0667 80 48 80Z"
            fill="#A63A3A"
          />
        </g>
      </svg>
    );
  } else if (statusBayar === "KADALUARSA") {
    badgeColor = "bg-[#E67E22]";
    title = "Pembayaran Kadaluarsa";
    description =
      "Waktu pembayaran telah habis. Klik Lanjutkan Pembayaran untuk mendapatkan token baru.";
    iconSvg = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="96"
        height="72"
        viewBox="0 0 96 72"
        fill="none"
        style={{ aspectRatio: "4/3" }}
      >
        <path
          d="M47.2 52.8L52.8 47.2L40 34.4V16H32V37.6L47.2 52.8ZM72 70V61.2C76.9333 58.8667 80.8333 55.4333 83.7 50.9C86.5667 46.3667 88 41.4 88 36C88 30.6 86.5667 25.6333 83.7 21.1C80.8333 16.5667 76.9333 13.1333 72 10.8V2C79.2667 4.53333 85.0833 8.91667 89.45 15.15C93.8167 21.3833 96 28.3333 96 36C96 43.6667 93.8167 50.6167 89.45 56.85C85.0833 63.0833 79.2667 67.4667 72 70ZM21.95 69.15C17.5833 67.25 13.7833 64.6833 10.55 61.45C7.31667 58.2167 4.75 54.4167 2.85 50.05C0.95 45.6833 0 41 0 36C0 31 0.95 26.3167 2.85 21.95C4.75 17.5833 7.31667 13.7833 10.55 10.55C13.7833 7.31667 17.5833 4.75 21.95 2.85C26.3167 0.95 31 0 36 0C41 0 45.6833 0.95 50.05 2.85C54.4167 4.75 58.2167 7.31667 61.45 10.55C64.6833 13.7833 67.25 17.5833 69.15 21.95C71.05 26.3167 72 31 72 36C72 41 71.05 45.6833 69.15 50.05C67.25 54.4167 64.6833 58.2167 61.45 61.45C58.2167 64.6833 54.4167 67.25 50.05 69.15C45.6833 71.05 41 72 36 72C31 72 26.3167 71.05 21.95 69.15ZM36 64C43.8 64 50.4167 61.2833 55.85 55.85C61.2833 50.4167 64 43.8 64 36C64 28.2 61.2833 21.5833 55.85 16.15C50.4167 10.7167 43.8 8 36 8C28.2 8 21.5833 10.7167 16.15 16.15C10.7167 21.5833 8 28.2 8 36C8 43.8 10.7167 50.4167 16.15 55.85C21.5833 61.2833 28.2 64 36 64Z"
          fill="#E67E22"
        />
      </svg>
    );
  } else {
    // Default ke Menunggu Pembayaran
    badgeColor = "bg-[#3B82F6]";
    title = "Menunggu Pembayaran";
    description = "Silakan selesaikan pembayaran Anda sebelum waktu habis.";
    iconSvg = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        style={{ aspectRatio: "1/1" }}
      >
        <mask
          id="mask0_800_13442"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="96"
          height="96"
        >
          <rect width="96" height="96" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_800_13442)">
          <path
            d="M47.2 64.8L52.8 59.2L40 46.4V28H32V49.6L47.2 64.8ZM72 82V73.2C76.9333 70.8667 80.8333 67.4333 83.7 62.9C86.5667 58.3667 88 53.4 88 48C88 42.6 86.5667 37.6333 83.7 33.1C80.8333 28.5667 76.9333 25.1333 72 22.8V14C79.2667 16.5333 85.0833 20.9167 89.45 27.15C93.8167 33.3833 96 40.3333 96 48C96 55.6667 93.8167 62.6167 89.45 68.85C85.0833 75.0833 79.2667 79.4667 72 82ZM21.95 81.15C17.5833 79.25 13.7833 76.6833 10.55 73.45C7.31667 70.2167 4.75 66.4167 2.85 62.05C0.95 57.6833 0 53 0 48C0 43 0.95 38.3167 2.85 33.95C4.75 29.5833 7.31667 25.7833 10.55 22.55C13.7833 19.3167 17.5833 16.75 21.95 14.85C26.3167 12.95 31 12 36 12C41 12 45.6833 12.95 50.05 14.85C54.4167 16.75 58.2167 19.3167 61.45 22.55C64.6833 25.7833 67.25 29.5833 69.15 33.95C71.05 38.3167 72 43 72 48C72 53 71.05 57.6833 69.15 62.05C67.25 66.4167 64.6833 70.2167 61.45 73.45C58.2167 76.6833 54.4167 79.25 50.05 81.15C45.6833 83.05 41 84 36 84C31 84 26.3167 83.05 21.95 81.15ZM36 76C43.8 76 50.4167 73.2833 55.85 67.85C61.2833 62.4167 64 55.8 64 48C64 40.2 61.2833 33.5833 55.85 28.15C50.4167 22.7167 43.8 20 36 20C28.2 20 21.5833 22.7167 16.15 28.15C10.7167 33.5833 8 40.2 8 48C8 55.8 10.7167 62.4167 16.15 67.85C21.5833 73.2833 28.2 76 36 76Z"
            fill="#2980B9"
          />
        </g>
      </svg>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-neutral-50 py-12 px-6">
      <div className="flex w-full max-w-[592px] p-12 flex-col items-center gap-8 rounded-xl border border-neutral-200 bg-white shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)]">
        {/* Ikon & Badge */}
        <div className="flex flex-col items-center gap-4">
          {iconSvg}
          <div
            className={`flex px-6 py-2 justify-center items-center gap-[10px] rounded-full ${badgeColor}`}
          >
            {/* Teks ngambil dari status yang diseragamin */}
            <span className="text-white font-sans text-[16px] font-bold uppercase tracking-wider">
              {statusBayar}
            </span>
          </div>
        </div>

        {/* Judul & Deskripsi */}
        <div className="flex flex-col gap-2 w-full">
          <h2 className="self-stretch text-[#01171A] text-center font-sans text-[24px] font-bold leading-[32px]">
            {title}
          </h2>
          <p className="self-stretch text-[#01171A] text-center font-sans text-[18px] font-medium leading-[27px]">
            {description}
          </p>
        </div>

        {/* Box Detail Identitas Trx */}
        <div className="flex p-6 flex-col items-start gap-4 self-stretch rounded-xl bg-[#FFF6EC]">
          <div className="flex justify-between items-center w-full">
            <span className="text-[#044B57] font-sans text-[18px] font-normal leading-[27px]">
              Nomor Invoice
            </span>
            <span className="text-[#022D34] font-sans text-[18px] font-bold leading-[27px]">
              {detail.invoice}
            </span>
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="text-[#044B57] font-sans text-[18px] font-normal leading-[27px]">
              Nominal
            </span>
            <span className="text-[#022D34] font-sans text-[18px] font-bold leading-[27px]">
              {formatRupiah(detail.nominal)}
            </span>
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="text-[#044B57] font-sans text-[18px] font-normal leading-[27px]">
              Metode Pembayaran
            </span>
            <span className="text-[#022D34] font-sans text-[18px] font-bold leading-[27px]">
              {formatPaymentMethod(detail.paymentMethod)}
            </span>
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="text-[#044B57] font-sans text-[18px] font-normal leading-[27px]">
              Tanggal Transaksi
            </span>
            <span className="text-[#022D34] font-sans text-[18px] font-bold leading-[27px]">
              {detail.tanggal}
            </span>
          </div>
        </div>

        {/* 🔥 BOX TIMER (KHUSUS MENUNGGU PEMBAYARAN) 🔥 */}
        {statusBayar === "MENUNGGU PEMBAYARAN" && (
          <div className="flex flex-col items-center justify-center p-4 gap-1 w-full rounded-xl bg-[#FEF1DA] border border-[#E67E22]/20">
            <span className="font-sans text-[#044B57] text-[14px]">
              Sisa Waktu Pembayaran
            </span>
            <span className="font-sans text-[#022D34] text-[20px] font-bold">
              {timeLeft}
            </span>
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="flex gap-4 w-full">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex h-10 px-4 py-2 justify-center items-center gap-[10px] flex-1 rounded-xl border border-[#033C46] text-[#033C46] text-center font-sans text-[16px] font-bold leading-[24px] hover:bg-neutral-50 hover:text-primary-600 hover:border-primary-600 active:scale-95 transition-all duration-200"
          >
            Kembali ke Dashboard
          </button>

          <button
            onClick={() => {
              if (statusBayar === "BERHASIL") {
                router.push(`/riwayat-trx/${detail.id}`);
              } else if (
                statusBayar === "MENUNGGU PEMBAYARAN" ||
                statusBayar === "GAGAL" ||
                statusBayar === "KADALUARSA"
              ) {
                handlePayNow();
              } else {
                router.push("/produk");
              }
            }}
            disabled={isPaying}
            className="flex h-10 px-4 py-2 justify-center items-center gap-[10px] flex-1 rounded-xl bg-[#044B57] text-white text-center font-sans text-[16px] font-bold leading-[24px] hover:bg-primary-600 hover:shadow-md hover:shadow-neutral-200 active:scale-95 transition-all duration-200"
          >
            {statusBayar === "BERHASIL"
              ? "Lihat Detail Transaksi"
              : statusBayar === "MENUNGGU PEMBAYARAN"
                ? "Bayar Sekarang"
                : statusBayar === "GAGAL" || statusBayar === "KADALUARSA"
                  ? isPaying
                    ? "Menyiapkan Pembayaran..."
                    : "Lanjutkan Pembayaran"
                  : "Buat Transaksi Baru"}
          </button>
        </div>
      </div>
    </div>
  );
}
