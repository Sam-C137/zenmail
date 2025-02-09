import { type NextRequest, NextResponse } from "next/server";
import { type MiddlewareFactory } from "@/middlewares/stack-middlewares";

export const createExtendSessionMiddleware: MiddlewareFactory = (next) => {
    return async function (request: NextRequest): Promise<NextResponse> {
        if (request.method === "GET") {
            const response = NextResponse.next();
            const token = request.cookies.get("session")?.value ?? null;
            if (token !== null) {
                // Only extend cookie expiration on GET requests since we can be sure
                // a new session wasn't set when handling the request.
                response.cookies.set("session", token, {
                    path: "/",
                    maxAge: 60 * 60 * 24 * 30,
                    sameSite: "lax",
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                });
            }
            return response;
        }

        return NextResponse.next();
    };
};
