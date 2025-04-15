import { type MiddlewareFactory } from "@/middlewares/stack-middlewares";
import { NextResponse } from "next/server";
import { isPublicRoute, publicRoutes } from "@/middlewares/public-routes";

export const createProtectRouteMiddleware: MiddlewareFactory = (next) => {
    return async function (request, event): Promise<NextResponse> {
        const token = request.cookies.get("session")?.value ?? null;

        if (token === null && !isPublicRoute(request.url)) {
            return NextResponse.redirect(
                new URL("/sign-in", request.nextUrl.origin),
            );
        }

        return next(request, event) as NextResponse;
    };
};
