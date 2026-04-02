type AlertType = "success" | "error";

type StatusAlertProps = {
    isOpen: boolean;
    type: AlertType;
    title: string;
    message: string;
};

const alertStyleMap = {
    success: {
        wrapper: "border-[#2D7A5B] bg-[#EAF5F0] text-[#2D7A5B]",
    },
    error: {
        wrapper: "border-[#B54343] bg-[#FBEDEE] text-[#B54343]",
    },
};

function AlertIcon({ type }: { type: AlertType }) {
    const isSuccess = type === "success";

    return (
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <circle cx="17" cy="17" r="15" stroke="currentColor" strokeWidth="3" opacity="0.95" />
            {isSuccess ? (
                <path d="M9.6 17.8l4.6 4.7L24.4 12.3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
                <>
                    <path d="M11 11l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M23 11 11 23" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </>
            )}
        </svg>
    );
}

export default function StatusAlert({ isOpen, type, title, message }: StatusAlertProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed right-5 bottom-5 z-[120] w-[min(560px,calc(100vw-2rem))]">
            <div className={`flex items-center gap-4 rounded-xl border px-5 py-4 shadow-sm ${alertStyleMap[type].wrapper}`}>
                <AlertIcon type={type} />
                <div className="min-w-0">
                    <p className="text-xl font-bold leading-6">{title}</p>
                    <p className="mt-1 text-lg leading-6">{message}</p>
                </div>
            </div>
        </div>
    );
}
