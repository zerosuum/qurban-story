import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function proxy(req) {
        const role = req.nextauth.token?.role as string | undefined;
        const pathname = req.nextUrl.pathname;
        const isAdminRole = role === "ADMIN" || role === "SUPERADMIN";

        if (isAdminRole && pathname === "/dashboard") {
            const redirectUrl = req.nextUrl.clone();
            redirectUrl.pathname = "/admin/dashboard";
            return NextResponse.redirect(redirectUrl);
        }

        return NextResponse.next();
    },
    {
        pages: {
            signIn: "/login",
        },
        callbacks: {
            authorized: ({ token, req }) => {
                if (!token) {
                    return false;
                }

                const pathname = req.nextUrl.pathname;
                const role = token.role as string | undefined;
                const isAdminRole = role === "ADMIN" || role === "SUPERADMIN";

                if (pathname.startsWith("/admin/manajemen-admin")) {
                    return role === "SUPERADMIN";
                }

                if (pathname.startsWith("/admin")) {
                    return isAdminRole;
                }

                return true;
            },
        },
    },
);

export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/:path*",
        "/profile/:path*",
        "/riwayat-trx/:path*",
        "/checkout/:path*",
    ],
};