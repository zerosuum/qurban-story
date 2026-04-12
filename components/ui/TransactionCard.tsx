import React from "react";
import Link from "next/link";
import StatusPembayaranBadge, {
  PembayaranStatus,
} from "./StatusPembayaranBadge";

type TransactionCardProps = {
  id: string;
  productName: string;
  invoice: string;
  date: string;
  status: PembayaranStatus | string;
};

export default function TransactionCard({
  id,
  productName,
  invoice,
  date,
  status,
}: TransactionCardProps) {
  return (
    <Link href={`/riwayat-trx/${id}`} className="block w-full">
      <div
        className="
          flex justify-between items-center
          w-full
          p-6
          rounded-xl
          border border-neutral-100
          bg-white
          shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)]
          hover:shadow-md hover:border-primary-200 transition-all cursor-pointer
          gap-4
        "
      >
        <div className="flex flex-col gap-1 items-start flex-1 min-w-0">
          <h3 className="font-sans text-[18px] font-bold leading-6.75 text-neutral-900 w-full truncate">
            {productName}
          </h3>

          <div className="flex items-center gap-2 font-sans text-[16px] font-medium leading-6 text-neutral-900 flex-wrap">
            <span>{invoice}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className="shrink-0"
            >
              <circle cx="5" cy="5" r="5" fill="#F3F3F3" />
            </svg>
            <span>{date}</span>
          </div>
        </div>

        <div className="shrink-0">
          <StatusPembayaranBadge status={status} />
        </div>
      </div>
    </Link>
  );
}
