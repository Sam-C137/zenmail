import { type MiddlewareFactory } from "@/middlewares/stack-middlewares";
import { NextResponse } from "next/server";

export const createCrsfMiddleware: MiddlewareFactory = (next) => {
    return async function (request, event): Promise<NextResponse> {
        // Ignore for GET requests.
        if (request.method === "GET") {
            return next(request, event) as NextResponse;
        }

        const originHeader = request.headers.get("Origin");
        // Prefer Host header but fall back to X-Forwarded-Host if needed.
        const hostHeader =
            request.headers.get("Host") ??
            request.headers.get("X-Forwarded-Host");

        if (!originHeader || !hostHeader) {
            return new NextResponse(null, { status: 403 });
        }

        let origin: URL;
        try {
            origin = new URL(originHeader);
        } catch {
            return new NextResponse(null, { status: 403 });
        }

        if (origin.host !== hostHeader) {
            return new NextResponse(null, { status: 403 });
        }

        return next(request, event) as NextResponse;
    };
};
