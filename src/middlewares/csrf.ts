import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { type MiddlewareFactory } from "@/middlewares/stack-middlewares";

export const createCrsfMiddleware: MiddlewareFactory = (next) => {
    return async function (request: NextRequest): Promise<NextResponse> {
        if (request.method === "GET") {
            return NextResponse.next();
        }
        const originHeader = request.headers.get("Origin");
        // NOTE: You may need to use `X-Forwarded-Host` instead
        let hostHeader = request.headers.get("Host");
        if (hostHeader === null) {
            hostHeader = request.headers.get("X-Forwarded-Host");
        }
        if (originHeader === null || hostHeader === null) {
            return new NextResponse(null, {
                status: 403,
            });
        }
        let origin: URL;
        try {
            origin = new URL(originHeader);
        } catch {
            return new NextResponse(null, {
                status: 403,
            });
        }
        if (origin.host !== hostHeader) {
            return new NextResponse(null, {
                status: 403,
            });
        }
        return NextResponse.next();
    };
};
