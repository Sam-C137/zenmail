import { type MiddlewareFactory } from "@/middlewares/stack-middlewares";
import { type NextRequest, NextResponse } from "next/server";

const publicRoutes = [
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/",
    "/api/clerk/webhook",
];

export const createProtectRouteMiddleware: MiddlewareFactory = (next) => {
    return async function (request: NextRequest): Promise<NextResponse> {
        const token = request.cookies.get("session")?.value ?? null;
        if (token === null) {
            if (
                !publicRoutes.some((route) =>
                    new RegExp(route).test(request.url),
                )
            ) {
                return new NextResponse(null, {
                    status: 302,
                    headers: {
                        Location: "/sign-in",
                    },
                });
            }
        }

        return NextResponse.next();
    };
};
