import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AdminDbRole = "SUPERADMIN" | "ADMIN";

export type AdminListItem = {
    id: string;
    name: string;
    email: string;
    role: AdminDbRole;
};

type CreateAdminPayload = {
    email: string;
};

type UpsertAdminResult = {
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
    };
    action: "created" | "updated";
};

type AdminQuery = {
    search?: string;
    page?: number;
    pageSize?: number;
};

export async function listAdmins(query: AdminQuery) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 10));
    const keyword = query.search?.trim();

    const whereClause = {
        role: {
            in: [UserRole.ADMIN, UserRole.SUPERADMIN],
        },
        ...(keyword
            ? {
                OR: [
                    { name: { contains: keyword, mode: "insensitive" as const } },
                    { email: { contains: keyword, mode: "insensitive" as const } },
                ],
            }
            : {}),
    };

    const [total, users] = await Promise.all([
        prisma.user.count({ where: whereClause }),
        prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
                createdAt: "desc",
            },
        }),
    ]);

    const mapped = users
        .map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        }))
        .filter((user) => user.role === "SUPERADMIN" || user.role === "ADMIN")
        .sort((a, b) => {
            if (a.role === b.role) {
                return b.createdAt.getTime() - a.createdAt.getTime();
            }

            return a.role === "SUPERADMIN" ? -1 : 1;
        })
        .map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        }));

    return {
        data: mapped,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
    };
}

export async function deleteAdminById(targetUserId: string, actorUserId: string) {
    const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    if (!user) {
        return null;
    }

    if (user.role === UserRole.SUPERADMIN) {
        throw new Error("Akun superadmin tidak dapat dihapus.");
    }

    if (user.role !== UserRole.ADMIN) {
        throw new Error("Hanya akun admin yang dapat dihapus.");
    }

    if (user.id === actorUserId) {
        throw new Error("Anda tidak dapat menghapus akun Anda sendiri.");
    }

    await prisma.user.delete({
        where: { id: targetUserId },
    });

    return user;
}

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

function deriveDisplayNameFromEmail(email: string) {
    const localPart = email.split("@")[0] ?? "admin";
    const normalized = localPart.replace(/[._-]+/g, " ").trim();

    if (!normalized) {
        return "Admin";
    }

    return normalized
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export async function upsertAdmin(payload: CreateAdminPayload): Promise<UpsertAdminResult> {
    const normalizedEmail = normalizeEmail(payload.email);
    const derivedName = deriveDisplayNameFromEmail(normalizedEmail);

    if (!normalizedEmail) {
        throw new Error("Email admin wajib diisi.");
    }

    const existing = await prisma.user.findFirst({
        where: {
            email: {
                equals: normalizedEmail,
                mode: "insensitive",
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    if (existing) {
        if (existing.role === UserRole.SUPERADMIN) {
            throw new Error("Email tersebut sudah terdaftar sebagai superadmin.");
        }

        const updated = await prisma.user.update({
            where: {
                id: existing.id,
            },
            data: {
                name: derivedName,
                email: normalizedEmail,
                role: UserRole.ADMIN,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        return {
            user: updated,
            action: "updated",
        };
    }

    const created = await prisma.user.create({
        data: {
            name: derivedName,
            email: normalizedEmail,
            provider: "google",
            providerId: `pending-${crypto.randomUUID()}`,
            role: UserRole.ADMIN,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    return {
        user: created,
        action: "created",
    };
}