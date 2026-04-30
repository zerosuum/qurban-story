"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StatusPembayaranBadge from "@/components/ui/StatusPembayaranBadge";
import StatusPelaporanBadge, {
  PelaporanStatus,
} from "@/components/ui/StatusPelaporanBadge";

function formatRupiah(value: string | number) {
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

function CustomFilter({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full md:w-[220px]">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex justify-between items-center w-full h-10 px-4 py-2 cursor-pointer transition-all border bg-white ${
          isOpen
            ? "rounded-t-xl border-[#DCDCDC] border-b-transparent"
            : "rounded-xl border-[#DCDCDC] hover:border-[#044B57]"
        }`}
      >
        <span className="font-sans text-[16px] font-normal leading-[24px] text-[#525252] select-none truncate">
          {value}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className={`shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            d="M12 15.4L6 9.4L7.4 8L12 12.6L16.6 8L18 9.4L12 15.4Z"
            fill="#525252"
          />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute top-[39px] left-0 w-full flex flex-col items-start bg-white border border-[#DCDCDC] border-t-[#DCDCDC] rounded-b-xl z-50 overflow-hidden shadow-lg">
          {options.map((opt, idx) => (
            <div
              key={idx}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 min-h-[40px] cursor-pointer hover:bg-neutral-50 transition-colors border-t border-transparent"
            >
              <span className="font-sans text-[16px] font-normal leading-[24px] text-[#000]">
                {opt}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const PAGE_SIZE = 5;

type TransactionRow = {
  id: string;
  invoice: string;
  customer: string;
  produk: string;
  tanggal: string;
  nominal: string;
  pembayaran: string;
  pelaporan: PelaporanStatus;
};

export default function RiwayatTransaksiPage() {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("Semua Pembayaran");
  const [reportFilter, setReportFilter] = useState("Semua Pelaporan");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          page: page.toString(),
          pageSize: PAGE_SIZE.toString(),
        });

        if (search) query.append("search", search);
        if (paymentFilter !== "Semua Pembayaran") {
          const mappedPayment =
            paymentFilter === "MENUNGGU PEMBAYARAN" ? "TERTUNDA" : paymentFilter;
          query.append("payment", mappedPayment);
        }
        if (reportFilter !== "Semua Pelaporan")
          query.append("report", reportFilter);

        const res = await fetch(`/api/transactions?${query.toString()}`);
        if (!res.ok) throw new Error("Gagal mengambil data transaksi.");

        const json = await res.json();
        setTransactions(json.data || []);
        setTotalPages(json.pagination?.totalPages || 1);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    const timerId = setTimeout(() => {
      fetchTransactions();
    }, 300);

    return () => clearTimeout(timerId);
  }, [page, search, paymentFilter, reportFilter]);

  const handleFilterChange = (
    setter: (value: string) => void,
    value: string,
  ) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-white flex flex-col items-center pb-24">
      <div className="flex flex-col items-center w-full px-6 py-[60px] gap-2 text-center">
        <h1 className="font-sans text-[36px] font-semibold leading-[46px] text-[#022D34]">
          Riwayat Transaksi
        </h1>
        <p className="font-sans text-[20px] font-medium leading-[26px] text-[#022D34]">
          Pantau semua transaksi qurban Anda.
        </p>
      </div>

      <div className="w-full max-w-[1140px] flex flex-col px-6 gap-6">
        <div className="flex flex-col lg:flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center w-full lg:max-w-[588px] h-10 px-6 gap-2 rounded-xl border border-[#DCDCDC] bg-white focus-within:border-[#044B57] transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.14583 15.3708 4.8875 14.1125C3.62917 12.8542 3 11.3167 3 9.5C3 7.68333 3.62917 6.14583 4.8875 4.8875C6.14583 3.62917 7.68333 3 9.5 3C11.3167 3 12.8542 3.62917 14.1125 4.8875C15.3708 6.14583 16 7.68333 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21ZM9.5 14C10.75 14 11.8125 13.5625 12.6875 12.6875C13.5625 11.8125 14 10.75 14 9.5C14 8.25 13.5625 7.1875 12.6875 6.3125C11.8125 5.4375 10.75 5 9.5 5C8.25 5 7.1875 5.4375 6.3125 6.3125C5.4375 7.1875 5 8.25 5 9.5C5 10.75 5.4375 11.8125 6.3125 12.6875C7.1875 13.5625 8.25 14 9.5 14Z"
                fill="#525252"
              />
            </svg>
            <input
              type="text"
              placeholder="Pencarian..."
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              className="flex-1 h-full bg-transparent outline-none font-sans text-[16px] italic text-[#525252] placeholder:text-[#525252]"
            />
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
            <CustomFilter
              value={paymentFilter}
              options={[
                "Semua Pembayaran",
                "BERHASIL",
                "MENUNGGU PEMBAYARAN",
                "KADALUARSA",
                "GAGAL",
                // "TERTUNDA",
              ]}
              onChange={(v) => handleFilterChange(setPaymentFilter, v)}
            />
            <CustomFilter
              value={reportFilter}
              options={[
                "Semua Pelaporan",
                "Tahap 1/3",
                "Tahap 2/3",
                "Selesai",
                "Belum Dimulai",
              ]}
              onChange={(v) => handleFilterChange(setReportFilter, v)}
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-[#DCDCDC] shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)] bg-white">
          <table className="w-full min-w-[950px] border-collapse text-left">
            <thead>
              <tr className="bg-[#044B57]">
                <th className="px-6 py-4 font-sans text-[16px] font-bold leading-[24px] text-white whitespace-nowrap">
                  Invoice
                </th>
                <th className="px-6 py-4 font-sans text-[16px] font-bold leading-[24px] text-white whitespace-nowrap">
                  Produk
                </th>
                <th className="px-6 py-4 font-sans text-[16px] font-bold leading-[24px] text-white whitespace-nowrap">
                  Tanggal
                </th>
                <th className="px-6 py-4 font-sans text-[16px] font-bold leading-[24px] text-white whitespace-nowrap">
                  Nominal (Rp)
                </th>
                <th className="px-6 py-4 font-sans text-[16px] font-bold leading-[24px] text-white whitespace-nowrap">
                  Pembayaran
                </th>
                <th className="px-6 py-4 font-sans text-[16px] font-bold leading-[24px] text-white whitespace-nowrap">
                  Pelaporan
                </th>
                <th className="px-6 py-4 font-sans text-[16px] font-bold leading-[24px] text-white text-center whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center font-sans text-neutral-500 italic"
                  >
                    Memuat data transaksi...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center font-sans text-neutral-500 italic"
                  >
                    Transaksi tidak ditemukan.
                  </td>
                </tr>
              ) : (
                transactions.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#F3F3F3] hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-sans text-[16px] text-neutral-900 whitespace-nowrap">
                      {item.invoice}
                    </td>
                    <td className="px-6 py-4 font-sans text-[16px] text-neutral-900 whitespace-pre-wrap leading-[24px] min-w-[150px]">
                      {item.produk}
                    </td>
                    <td className="px-6 py-4 font-sans text-[16px] text-neutral-900 whitespace-nowrap">
                      {item.tanggal}
                    </td>
                    <td className="px-6 py-4 font-sans text-[16px] text-neutral-900 whitespace-nowrap">
                      {formatRupiah(item.nominal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusPembayaranBadge
                        status={
                          item.pembayaran === "TERTUNDA" ||
                          item.pembayaran === "PAYMENT_PENDING"
                            ? "MENUNGGU PEMBAYARAN"
                            : item.pembayaran
                        }
                        size="sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusPelaporanBadge status={item.pelaporan} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center h-full w-full">
                        <Link
                          href={`/riwayat-trx/${item.id}`}
                          className="hover:opacity-70 transition-opacity"
                          title="Lihat Detail"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="15"
                            viewBox="0 0 22 15"
                            fill="none"
                          >
                            <path
                              d="M14.1875 10.6875C15.0625 9.8125 15.5 8.75 15.5 7.5C15.5 6.25 15.0625 5.1875 14.1875 4.3125C13.3125 3.4375 12.25 3 11 3C9.75 3 8.6875 3.4375 7.8125 4.3125C6.9375 5.1875 6.5 6.25 6.5 7.5C6.5 8.75 6.9375 9.8125 7.8125 10.6875C8.6875 11.5625 9.75 12 11 12C12.25 12 13.3125 11.5625 14.1875 10.6875ZM9.0875 9.4125C8.5625 8.8875 8.3 8.25 8.3 7.5C8.3 6.75 8.5625 6.1125 9.0875 5.5875C9.6125 5.0625 10.25 4.8 11 4.8C11.75 4.8 12.3875 5.0625 12.9125 5.5875C13.4375 6.1125 13.7 6.75 13.7 7.5C13.7 8.25 13.4375 8.8875 12.9125 9.4125C12.3875 9.9375 11.75 10.2 11 10.2C10.25 10.2 9.6125 9.9375 9.0875 9.4125ZM4.35 12.9625C2.35 11.6042 0.9 9.78333 0 7.5C0.9 5.21667 2.35 3.39583 4.35 2.0375C6.35 0.679167 8.56667 0 11 0C13.4333 0 15.65 0.679167 17.65 2.0375C19.65 3.39583 21.1 5.21667 22 7.5C21.1 9.78333 19.65 11.6042 17.65 12.9625C15.65 14.3208 13.4333 15 11 15C8.56667 15 6.35 14.3208 4.35 12.9625ZM16.1875 11.5125C17.7625 10.5208 18.9667 9.18333 19.8 7.5C18.9667 5.81667 17.7625 4.47917 16.1875 3.4875C14.6125 2.49583 12.8833 2 11 2C9.11667 2 7.3875 2.49583 5.8125 3.4875C4.2375 4.47917 3.03333 5.81667 2.2 7.5C3.03333 9.18333 4.2375 10.5208 5.8125 11.5125C7.3875 12.5042 9.11667 13 11 13C12.8833 13 14.6125 12.5042 16.1875 11.5125Z"
                              fill="#2D6A4F"
                            />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center w-full max-w-[264px] mx-auto mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex justify-center items-center w-10 h-10 rounded-xl border border-[#044B57] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M10 18L4 12L10 6L11.4 7.45L7.85 11H20V13H7.85L11.4 16.55L10 18Z"
                fill="#033C46"
              />
            </svg>
          </button>
          <span className="font-sans text-[16px] font-normal leading-[20px] text-[#000]">
            Halaman {page} dari {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="flex justify-center items-center w-10 h-10 rounded-xl border border-[#044B57] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M14 6L20 12L14 18L12.6 16.55L16.15 13L4 13V11L16.15 11L12.6 7.45L14 6Z"
                fill="#033C46"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
