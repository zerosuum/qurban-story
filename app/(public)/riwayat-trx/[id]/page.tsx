"use client";

import ProgressPelaporan from "@/components/ui/ProgressPelaporan";
import TransactionDetailCard from "@/components/ui/TransactionDetailCard";
import DocumentationCard from "@/components/ui/DocumentationCard";
import DistributionReportCard from "@/components/ui/DistributionReportCard";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TransactionDocumentation = {
  photoUrls: string[];
  videoUrl: string | null;
};

type DetailResponse = {
  data: {
    id: string;
    documentation: TransactionDocumentation;
  };
};

export default function DetailTransaksiPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [documentation, setDocumentation] = useState<TransactionDocumentation>({
    photoUrls: [],
    videoUrl: null,
  });

  useEffect(() => {
    const id = params?.id;
    if (!id) return;

    let active = true;

    const loadDetail = async () => {
      try {
        const response = await fetch(`/api/transactions/${id}`);
        if (!response.ok) return;

        const payload = (await response.json()) as DetailResponse;
        if (!active) return;

        setDocumentation(
          payload.data.documentation ?? { photoUrls: [], videoUrl: null },
        );
      } catch {
        if (!active) return;
        setDocumentation({ photoUrls: [], videoUrl: null });
      }
    };

    void loadDetail();

    return () => {
      active = false;
    };
  }, [params?.id]);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-white flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-[792px] flex flex-col gap-6">
        {/* Tombol Kembali */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 w-max px-0 pt-6 pb-2 text-[#033C46] font-bold text-[16px] leading-[24px] hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none outline-none"
        >
          {/* ICON */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0"
          >
            <mask
              id="mask0_back"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="24"
              height="24"
            >
              <rect width="24" height="24" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_back)">
              <path
                d="M10 18L4 12L10 6L11.4 7.45L7.85 11H20V13H7.85L11.4 16.55L10 18Z"
                fill="#033C46"
              />
            </g>
          </svg>
          <span>Kembali</span>
        </button>

        <TransactionDetailCard />
        <ProgressPelaporan />

        <DocumentationCard
          photoUrls={documentation.photoUrls}
          videoUrl={documentation.videoUrl}
        />

        <DistributionReportCard />
      </div>
    </div>
  );
}
