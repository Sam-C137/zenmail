import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { microsoft } from "@/server/oauth";
import { decodeIdToken, OAuth2RequestError } from "arctic";
import { type } from "arktype";
import { db } from "@/server/db";
import {
    createSession,
    generateSessionToken,
    setSessionTokenCookie,
} from "@/server/session";

const microsoftUserClaims = type({
    sub: "string",
    name: "string",
    email: "string.email",
});

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const cookieStore = await cookies();
    const storedState = cookieStore.get("microsoft_oauth_state")?.value ?? null;
    const codeVerifier =
        cookieStore.get("microsoft_oauth_code_verifier")?.value ?? null;

    if (
        code === null ||
        state === null ||
        storedState === null ||
        codeVerifier === null ||
        state !== storedState
    ) {
        return new Response(null, {
            status: 400,
        });
    }

    try {
        const tokens = await microsoft.validateAuthorizationCode(
            code,
            codeVerifier,
        );
        const claims = decodeIdToken(tokens.idToken());
        const validClaims = microsoftUserClaims(claims);
        if (validClaims instanceof type.errors) {
            return new Response(null, {
                status: 400,
            });
        }

        const microsoftId = validClaims.sub;
        const email = validClaims.email;

        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser !== null) {
            const sessionToken = generateSessionToken();
            const session = await createSession(sessionToken, existingUser.id);
            await setSessionTokenCookie(sessionToken, session.expiresAt);
            return new Response(null, {
                status: 302,
                headers: {
                    Location: "/",
                },
            });
        }

        const user = await db.user.create({
            data: {
                microsoftId,
                email,
                firstName: validClaims.name.split(" ").at(0) ?? "Alias",
                lastName: validClaims.name.split(" ").at(-1) ?? null,
            },
        });

        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, user.id);
        await setSessionTokenCookie(sessionToken, session.expiresAt);
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/",
            },
        });
    } catch (e) {
        console.error(e);
        if (e instanceof OAuth2RequestError) {
            return new Response(null, {
                status: 400,
            });
        }

        return new Response(null, {
            status: 500,
        });
    }
}
