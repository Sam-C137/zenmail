import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { github } from "@/server/oauth";
import { OAuth2RequestError } from "arctic";
import { type } from "arktype";
import { db } from "@/server/db";
import {
    createSession,
    generateSessionToken,
    setSessionTokenCookie,
} from "@/server/session";

const githubUserClaims = type({
    login: "string",
    id: "number",
    name: "string",
    email: "string",
    "avatar_url?": "string",
});

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const cookieStore = await cookies();
    const storedState = cookieStore.get("github_oauth_state")?.value ?? null;

    if (
        code === null ||
        state === null ||
        storedState === null ||
        state !== storedState
    ) {
        return new Response(null, {
            status: 400,
        });
    }

    try {
        const tokens = await github.validateAuthorizationCode(code);

        const githubUserResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken()}`,
            },
        });
        const claims = githubUserClaims(await githubUserResponse.json());
        if (claims instanceof type.errors) {
            return new Response(null, {
                status: 400,
            });
        }

        const githubId = claims.id;
        const email = claims.email;

        const existingUser = await db.user.findUnique({
            where: {
                githubId,
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
                githubId,
                email,
                firstName: claims.name,
                imageUrl: claims.avatar_url,
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
