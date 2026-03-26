type FilterPembayaranProps = {
    value: string;
    onChange: (value: string) => void;
};

export default function FilterPembayaran({ value, onChange }: FilterPembayaranProps) {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-10 min-w-52 rounded-xl border border-neutral-100 bg-white px-3 text-sm text-neutral-600 outline-none transition-colors focus:border-primary-500"
        >
            <option className="border border-transparent hover:border-primary-200">Semua Pembayaran</option>
            <option className="border border-transparent hover:border-primary-200">BERHASIL</option>
            <option className="border border-transparent hover:border-primary-200">KADALUARSA</option>
            <option className="border border-transparent hover:border-primary-200">GAGAL</option>
            <option className="border border-transparent hover:border-primary-200">TERTUNDA</option>
        </select>
    );
}
