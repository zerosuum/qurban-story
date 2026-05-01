"use client";

import DateFieldWithPicker from "./DateFieldWithPicker";

type UpdatePelaporanModalProps = {
    isOpen: boolean;
    selectedCount: number;
    tahap1Date: string;
    tahap2Date: string;
    tahap3Date: string;
    onChangeTahap1Date: (value: string) => void;
    onChangeTahap2Date: (value: string) => void;
    onChangeTahap3Date: (value: string) => void;
    onClose: () => void;
    onApply: () => void;
};

export default function UpdatePelaporanModal({
    isOpen,
    selectedCount,
    tahap1Date,
    tahap2Date,
    tahap3Date,
    onChangeTahap1Date,
    onChangeTahap2Date,
    onChangeTahap3Date,
    onClose,
    onApply,
}: UpdatePelaporanModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-800/35 p-4 backdrop-blur-[1px]">
            <div className="relative w-full max-w-[760px] rounded-xl border border-neutral-100 bg-white p-6 shadow-[0_8px_28px_-6px_rgba(24,39,75,0.12),0_18px_88px_-4px_rgba(24,39,75,0.14)]">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-5 top-4 cursor-pointer text-xl leading-none text-neutral-400 hover:text-neutral-600"
                    aria-label="Tutup modal progress"
                >
                    ×
                </button>

                <h3 className="text-[38px] font-bold leading-tight text-black">Progress Pelaporan</h3>

                <div className="mt-6 flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                        <img src="/icons/progress-check.svg" alt="Tahap 1" className="h-8 w-8" />
                        <div className="w-full">
                            <p className=" font-medium text-neutral-900">Tahap 1: Disembelih</p>
                            <p className="mt-1 text-sm text-neutral-700">Hewan qurban telah disembelih sesuai syariat Islam.</p>
                            <DateFieldWithPicker
                                value={tahap1Date}
                                onChange={onChangeTahap1Date}
                                placeholder="dd/mm/yyyy"
                            />
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <img src="/icons/progress-clock.svg" alt="Tahap 2" className="h-8 w-8" />
                        <div className="w-full">
                            <p className="font-medium text-neutral-900">Tahap 2: Distribusi</p>
                            <p className="mt-1 text-sm text-neutral-700">Hewan qurban telah disembelih sesuai syariat Islam.</p>
                            <DateFieldWithPicker
                                value={tahap2Date}
                                onChange={onChangeTahap2Date}
                                placeholder="dd/mm/yyyy"
                            />
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <img src="/icons/progress-cross.svg" alt="Tahap 3" className="h-8 w-8" />
                        <div className="w-full">
                            <p className="font-medium text-neutral-900">Tahap 3: Selesai</p>
                            <p className="mt-1 text-sm text-neutral-700">Hewan qurban telah disembelih sesuai syariat Islam.</p>
                            <DateFieldWithPicker
                                value={tahap3Date}
                                onChange={onChangeTahap3Date}
                                placeholder="dd/mm/yyyy"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 cursor-pointer rounded-xl border border-primary-500 bg-white px-6 text-base font-semibold text-primary-500 hover:bg-neutral-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onApply}
                        className="h-10 cursor-pointer rounded-xl bg-primary-500 px-6 text-base font-semibold text-white hover:bg-primary-600"
                    >
                        Terapkan ke {selectedCount} transaksi
                    </button>
                </div>
            </div>
        </div>
    );
}
