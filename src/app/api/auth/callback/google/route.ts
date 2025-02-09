import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import { decodeIdToken, OAuth2RequestError } from "arctic";
import { google } from "@/server/oauth";
import { type } from "arktype";
import { db } from "@/server/db";
import {
    createSession,
    generateSessionToken,
    setSessionTokenCookie,
} from "@/server/session";

const googleUserClaims = type({
    sub: "string",
    name: "string",
    email: "string.email",
    given_name: "string",
    "family_name?": "string",
});

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const cookieStore = await cookies();
    const storedState = cookieStore.get("state")?.value ?? null;
    const codeVerifier = cookieStore.get("code_verifier")?.value ?? null;

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
        const tokens = await google.validateAuthorizationCode(
            code,
            codeVerifier,
        );
        const claims = decodeIdToken(tokens.idToken());
        const validClaims = googleUserClaims(claims);
        if (validClaims instanceof type.errors) {
            return new Response(null, {
                status: 400,
            });
        }

        const googleId = validClaims.sub;
        const email = validClaims.email;

        const existingUser = await db.user.findUnique({
            where: {
                googleId,
            },
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
                googleId,
                email,
                firstName: validClaims.given_name,
                lastName: validClaims.family_name,
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
