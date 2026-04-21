import { handleCreateAdmin, handleListAdmins } from "@/lib/admins/admin.controller";

export async function GET(request: Request) {
    return handleListAdmins(request);
}

export async function POST(request: Request) {
    return handleCreateAdmin(request);
}