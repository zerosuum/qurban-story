import Sidebar from "@/components/Sidebar";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-100">
            <Sidebar />
            <div className="ml-66 min-w-0 flex flex-col">
                <AdminNavbar />
                <main className="flex-1 min-w-0">{children}</main>
            </div>
        </div>
    );
}