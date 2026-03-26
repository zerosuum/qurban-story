export default function AdminNavbar() {

    const adminName = "SuperAdmin"
    const adminEmail = "superadmin@qurbanstory.com"

    return (
        <div className="bg-white p-8 flex flex-row justify-between w-full h-20 items-center">
            <div>
                <p className="font-semibold">Dashboard</p>
            </div>
            <div className="flex flex-row items-center gap-4">
                <div>
                    <img src="/icons/profile.svg" alt="Profile" className="w-8.75 h-8.75" />
                </div>
                <div>
                    <p>{adminName}</p>
                    <p>{adminEmail}</p>
                </div>
            </div>
        </div>
    );
}