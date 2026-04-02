"use client";

type DocumentationCardProps = {
  photoUrls?: string[];
  videoUrl?: string | null;
};

function ImagePlaceholderIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path
        d="M4 36C2.9 36 1.95833 35.6083 1.175 34.825C0.391667 34.0417 0 33.1 0 32V4C0 2.9 0.391667 1.95833 1.175 1.175C1.95833 0.391667 2.9 0 4 0H32C33.1 0 34.0417 0.391667 34.825 1.175C35.6083 1.95833 36 2.9 36 4V32C36 33.1 35.6083 34.0417 34.825 34.825C34.0417 35.6083 33.1 36 32 36H4ZM4 32H32V4H4V32ZM6 28H30L22.5 18L16.5 26L12 20L6 28Z"
        fill="#1C1B1F"
      />
    </svg>
  );
}

function VideoPlaceholderIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path
        d="M10 8H22C23.1046 8 24 8.89543 24 10V14L30 10V26L24 22V26C24 27.1046 23.1046 28 22 28H10C8.89543 28 8 27.1046 8 26V10C8 8.89543 8.89543 8 10 8Z"
        fill="#1C1B1F"
      />
    </svg>
  );
}

export default function DocumentationCard({
  photoUrls = [],
  videoUrl = null,
}: DocumentationCardProps) {
  const hasPhotos = photoUrls.length > 0;
  const hasVideo = Boolean(videoUrl);

  return (
    <div className="flex flex-col w-full max-w-[792px] p-6 rounded-xl border border-neutral-200 bg-white shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)] gap-4">
      {/* Title */}
      <h2 className="text-[20px] font-bold leading-[26px] text-neutral-900">
        Dokumentasi
      </h2>

      {/* FOTO */}
      <div className="flex flex-col gap-3 w-full">
        <p className="text-[18px] leading-[27px] text-neutral-900">Foto</p>

        <div className="flex gap-4 flex-wrap">
          {hasPhotos
            ? photoUrls.map((url, i) => (
              <div
                key={`${url}-${i}`}
                className="w-[168px] h-[168px] overflow-hidden rounded-xl bg-neutral-100"
              >
                <img
                  src={url}
                  alt={`Dokumentasi foto ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))
            : [1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className="w-[168px] h-[168px] flex items-center justify-center rounded-xl bg-neutral-100"
              >
                <ImagePlaceholderIcon />
              </div>
            ))}
        </div>
      </div>

      {/* VIDEO */}
      <div className="flex flex-col gap-3 w-full">
        <p className="text-[18px] leading-[27px] text-neutral-900">Video</p>

        <div className="w-full max-w-[418px] aspect-square flex flex-col items-center justify-center rounded-xl bg-neutral-100 gap-2 text-center overflow-hidden">
          {hasVideo ? (
            <video src={videoUrl ?? undefined} controls className="h-full w-full object-cover" />
          ) : (
            <>
              <div className="flex items-center justify-center">
                <VideoPlaceholderIcon />
              </div>

              <p className="text-[12px] text-neutral-900">
                Video akan tersedia setelah proses selesai.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}