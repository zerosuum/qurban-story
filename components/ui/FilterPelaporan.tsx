type FilterPelaporanProps = {
    value: string;
    onChange: (value: string) => void;
};

export default function FilterPelaporan({ value, onChange }: FilterPelaporanProps) {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-10 min-w-52 rounded-xl border border-neutral-100 bg-white px-3 text-sm text-neutral-600 outline-none focus:border-primary-500"
        >
            <option className="border border-transparent hover:border-primary-200">Semua Pelaporan</option>
            <option className="border border-transparent hover:border-primary-200">Tahap 1/3</option>
            <option className="border border-transparent hover:border-primary-200">Tahap 2/3</option>
            <option className="border border-transparent hover:border-primary-200">Selesai</option>
            <option className="border border-transparent hover:border-primary-200">Belum Dimulai</option>
        </select>
    );
}
