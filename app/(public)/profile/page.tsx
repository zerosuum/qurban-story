"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import LogoutModal from "@/components/ui/LogoutModal";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-white flex flex-col items-center pt-8 md:pt-12 px-4 relative">
      {/* Title */}
      <div className="w-full max-w-[544px] mb-4 md:mb-6">
        <h1 className="text-primary-700 text-[28px] md:text-[36px] font-bold leading-[38px] md:leading-[46px] text-center">
          Profil Saya
        </h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-[544px] flex flex-col gap-5 md:gap-6 px-5 md:px-6 py-5 md:py-6 border border-neutral-100 rounded-xl bg-white shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)]">
        {/* Section Title */}
        <h2 className="text-neutral-900 text-[16px] md:text-[18px] font-semibold">
          Informasi Akun
        </h2>

        {/* Nama Lengkap */}
        <div className="flex flex-col w-full gap-1.5">
          <label className="text-neutral-900 text-[14px] md:text-[16px]">
            Nama Lengkap
          </label>

          <input
            type="text"
            disabled
            value={session?.user?.name ?? ""}
            className="
              w-full
              h-11
              px-4
              rounded-xl
              bg-neutral-50
              text-neutral-500
              text-[14px]
              md:text-[15px]
            "
          />
        </div>

        {/* Email */}
        <div className="flex flex-col w-full gap-1.5">
          <label className="text-neutral-900 text-[14px] md:text-[16px]">
            Email
          </label>

          <input
            type="text"
            disabled
            value={session?.user?.email ?? ""}
            className="
              w-full
              h-11
              px-4
              rounded-xl
              bg-neutral-50
              text-neutral-500
              text-[14px]
              md:text-[15px]
            "
          />
        </div>

        {/* Info text */}
        <p className="text-neutral-400 text-[12px] md:text-[13px] italic">
          Nama dan email tidak dapat diubah.
        </p>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => setIsLogoutOpen(true)}
        className="
          w-full
          max-w-[544px]
          h-11
          mt-6
          rounded-xl
          bg-primary-500
          text-white
          font-medium
          flex
          items-center
          justify-center
          hover:bg-primary-600 hover:shadow-md hover:shadow-neutral-200 active:scale-95 transition-all duration-200
        "
      >
        Keluar dari Akun
      </button>

      {/* Modal */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
    </div>
  );
}
