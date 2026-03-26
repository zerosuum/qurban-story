type PaginationProps = {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
};

export default function Pagination({
    page,
    totalPages,
    onPrev,
    onNext,
}: PaginationProps) {
    return (
        <div className="mt-4 flex items-center justify-end gap-6">
            <button
                type="button"
                onClick={onPrev}
                disabled={page === 1}
                className="h-9 w-9 rounded-xl border border-primary-500 text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <span aria-hidden="true">←</span>
            </button>

            <p className="text-md text-black">
                Halaman {page} dari {totalPages}
            </p>

            <button
                type="button"
                onClick={onNext}
                disabled={page === totalPages}
                className="h-9 w-9 rounded-xl border border-primary-500 text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <span aria-hidden="true">→</span>
            </button>
        </div>
    );
}
