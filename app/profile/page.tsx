"use client";

import { useSession, signOut } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-white flex flex-col items-center pt-6">
      {/* Title */}
      <div className="w-full max-w-360 px-82.5 mb-2">
        <h1 className="text-primary-700 text-[36px] font-bold leading-11.5 text-center">
          Profil Saya
        </h1>
      </div>

      {/* Card */}
      <div className="w-136 flex flex-col gap-6 px-6 py-4 border border-neutral-100 rounded-xl bg-white shadow-[0_2px_4px_-2px_rgba(24,39,75,0.12),0_4px_4px_-2px_rgba(24,39,75,0.08)]">
        {/* Section Title */}
        <h2 className="text-neutral-900 text-[16px] font-semibold">
          Informasi Akun
        </h2>

        {/* Nama Lengkap */}
        <div className="flex flex-col w-full gap-1">
          <label className="text-neutral-900 text-[16px]">Nama Lengkap</label>

          <input
            type="text"
            disabled
            value={session?.user?.name ?? ""}
            className="
              w-full
              h-10
              px-4
              rounded-xl
              bg-neutral-50
              text-neutral-500
              text-[14px]
            "
          />
        </div>

        {/* Email */}
        <div className="flex flex-col w-full gap-1">
          <label className="text-neutral-900 text-[16px]">Email</label>

          <input
            type="text"
            disabled
            value={session?.user?.email ?? ""}
            className="
              w-full
              h-10
              px-4
              rounded-xl
              bg-neutral-50
              text-neutral-500
              text-[14px]
            "
          />
        </div>

        {/* Info text */}
        <p className="text-neutral-300 text-[12px]">
          Nama dan email tidak dapat diubah.
        </p>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="
          w-136
          h-10
          mt-6
          rounded-xl
          bg-primary-500
          text-white
          font-medium
          flex
          items-center
          justify-center
        "
      >
        Keluar dari Akun
      </button>
    </div>
  );
}
