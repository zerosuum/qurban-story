type DocumentationAlertProps = {
    variant: "success" | "warning" | "error";
    title: string;
    message: string;
    onClose?: () => void;
};

export default function DocumentationAlert({ variant, title, message, onClose }: DocumentationAlertProps) {
    const styles =
        variant === "success"
            ? "border-[#6CA58C] bg-[#E6F4EE] text-[#2E6B53]"
            : variant === "warning"
                ? "border-[#E89B4A] bg-[#FFF3E8] text-[#C66A1F]"
                : "border-[#D67171] bg-[#FDEEEE] text-[#B54040]";

    return (
        <div className={`fixed bottom-6 right-6 z-120 w-[min(420px,calc(100vw-2rem))] rounded-xl border px-5 py-4 ${styles}`}>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-2 text-lg leading-none text-current/70 hover:text-current"
                    aria-label="Tutup notifikasi"
                >
                    ×
                </button>
            )}
            <div className="flex items-start gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-current text-base font-bold">
                    {variant === "success" ? "✓" : "!"}
                </span>
                <div>
                    <p className="font-bold">{title}</p>
                    <p className="mt-1 text-sm">{message}</p>
                </div>
            </div>
        </div>
    );
}
