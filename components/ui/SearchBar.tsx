type SearchBarProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
};

export default function SearchBar({
    value,
    onChange,
    placeholder = "Pencarian...",
    className = "",
    inputClassName = "",
}: SearchBarProps) {
    return (
        <div className={`relative w-full ${className}`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-300"
            >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
            </svg>

            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={`h-10 w-full min-w-0 rounded-xl border border-neutral-100 bg-white pl-10 pr-3 text-sm text-neutral-500 outline-none focus:border-primary-500 placeholder:italic ${inputClassName}`}
            />
        </div>
    );
}
