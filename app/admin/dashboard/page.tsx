import DashboardCard from "@/components/ui/DashboardCard";
import TransactionTable from "@/components/ui/TransactionTable";

export default function DashboardPage() {
    return (
        <main>
            <div className="flex flex-col p-6 gap-6">
                <div className="flex flex-col">
                    <p className="text-xl font-bold">Dashboard Admin</p>
                    <p className="text-lg font-medium">Kelola transaksi dan pelaporan qurban.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
                    <DashboardCard title="Total Transaksi" value="2.847" variant="blue" />
                    <DashboardCard title="Pembayaran Berhasil" value="2.103" variant="green" />
                    <DashboardCard title="Menunggu Pembayaran" value="412" variant="yellow" />
                    <DashboardCard title="Tanpa Dokumentasi" value="87" variant="red" />
                </div>
                <div className="w-full rounded-xl border border-neutral-200 p-6 flex flex-col gap-4 h-fit bg-white">
                    <h5 className="font-bold text-xl">Progress Pelaporan</h5>
                    <div>
                        <div className="w-full flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between w-full font-semibold text-primary-500">
                                <p>Tahap 1 - Disembelih</p>
                                <p>430</p>
                            </div>
                            <div className="w-full bg-neutral-100 rounded-full">
                                <div className="bg-primary-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                            </div>
                            <div className="flex flex-row items-center justify-between w-full font-semibold text-primary-500">
                                <p>Tahap 2 - Distribusi</p>
                                <p>430</p>
                            </div>
                            <div className="w-full bg-neutral-100 rounded-full">
                                <div className="bg-primary-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                            </div>
                            <div className="flex flex-row items-center justify-between w-full font-semibold text-primary-500">
                                <p>Tahap 3 - Selesai</p>
                                <p>1243</p>
                            </div>
                            <div className="w-full bg-neutral-100">
                                <div className="bg-primary-500 h-2 rounded-full" style={{ width: "55%" }}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <TransactionTable />
            </div>
        </main>
    );
}