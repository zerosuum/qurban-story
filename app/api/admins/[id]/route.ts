import { handleDeleteAdmin } from "@/lib/admins/admin.controller";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

export async function DELETE(_: Request, { params }: Params) {
    const { id } = await params;
    return handleDeleteAdmin(id);
}