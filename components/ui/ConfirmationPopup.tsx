import Button from "./Button";

type ConfirmationPopupProps = {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function ConfirmationPopup({
    isOpen,
    title,
    message,
    confirmLabel = "Ya, Simpan",
    cancelLabel = "Batal",
    isLoading = false,
    onCancel,
    onConfirm,
}: ConfirmationPopupProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-800/35 p-4 backdrop-blur-[1px]">
            <div className="relative w-full max-w-[560px] rounded-xl border border-neutral-100 bg-white p-6 shadow-[0_8px_28px_-6px_rgba(24,39,75,0.12),0_18px_88px_-4px_rgba(24,39,75,0.14)]">
                <button
                    type="button"
                    onClick={onCancel}
                    className="absolute top-4 right-4 cursor-pointer text-xl leading-none text-neutral-400 hover:text-neutral-500"
                    aria-label="Tutup konfirmasi"
                >
                    ×
                </button>

                <p className="font-bold text-black">{title}</p>
                <p className="mt-2 text-neutral-500">{message}</p>

                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        className="border border-primary-500 bg-white text-primary-500 hover:bg-neutral-50"
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button type="button" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? "Menyimpan..." : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
