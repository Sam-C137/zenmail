import { generateCodeVerifier, generateState } from "arctic";
import { microsoft } from "@/server/oauth";
import { cookies } from "next/headers";

export async function GET() {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = microsoft.createAuthorizationURL(state, codeVerifier, [
        "openid",
        "profile",
        "email",
    ]);

    const cookiesStore = await cookies();
    cookiesStore.set("microsoft_oauth_state", state, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax",
    });

    cookiesStore.set("microsoft_oauth_code_verifier", codeVerifier, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax",
    });

    return new Response(null, {
        status: 302,
        headers: {
            Location: url.toString(),
        },
    });
}
