import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteAdminById, listAdmins, upsertAdmin } from "@/lib/admins/admin.service";

function parsePositiveInt(value: string | null, defaultValue: number) {
    if (!value) return defaultValue;

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) return defaultValue;

    return parsed;
}

async function requireAdminSession() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return null;
    }

    const role = session.user.role;
    const isAdminRole = role === "ADMIN" || role === "SUPERADMIN";

    if (!isAdminRole) {
        return null;
    }

    return session;
}

export async function handleListAdmins(request: Request) {
    const session = await requireAdminSession();

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);

        const result = await listAdmins({
            search: searchParams.get("search") ?? undefined,
            page: parsePositiveInt(searchParams.get("page"), 1),
            pageSize: parsePositiveInt(searchParams.get("pageSize"), 10),
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal mengambil data admin.";
        return NextResponse.json({ message }, { status: 500 });
    }
}

export async function handleDeleteAdmin(id: string) {
    const session = await requireAdminSession();

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPERADMIN") {
        return NextResponse.json({ message: "Hanya superadmin yang dapat menghapus admin." }, { status: 403 });
    }

    try {
        const deleted = await deleteAdminById(id, session.user.id);

        if (!deleted) {
            return NextResponse.json({ message: "Admin tidak ditemukan." }, { status: 404 });
        }

        return NextResponse.json(
            {
                message: `Admin ${deleted.name} berhasil dihapus.`,
                data: deleted,
            },
            { status: 200 },
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal menghapus admin.";
        return NextResponse.json({ message }, { status: 400 });
    }
}

export async function handleCreateAdmin(request: Request) {
    const session = await requireAdminSession();

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPERADMIN") {
        return NextResponse.json({ message: "Hanya superadmin yang dapat menambah admin." }, { status: 403 });
    }

    try {
        const body = (await request.json()) as {
            email?: string;
        };

        const result = await upsertAdmin({
            email: body.email ?? "",
        });

        const message =
            result.action === "created"
                ? `Admin ${result.user.name} berhasil ditambahkan.`
                : `Akun ${result.user.email} berhasil dijadikan admin.`;

        return NextResponse.json(
            {
                message,
                data: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    role: result.user.role,
                },
            },
            { status: result.action === "created" ? 201 : 200 },
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal menambahkan admin.";
        return NextResponse.json({ message }, { status: 400 });
    }
}