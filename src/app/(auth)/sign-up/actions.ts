"use server";

import { SignUpSchema } from "@/lib/validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { type } from "arktype";
import { db } from "@/server/db";
import {
    createSession,
    generateSessionToken,
    setSessionTokenCookie,
} from "@/server/session";
import { hash } from "bcrypt";

export async function register(
    credentials: typeof SignUpSchema.infer,
): Promise<{
    error: string;
}> {
    try {
        const data = SignUpSchema(credentials);
        if (data instanceof type.errors) {
            return {
                error: data.message,
            };
        }
        const { email, password, firstName } = data;

        const existingUser = await db.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return {
                error: "User already exists",
            };
        }

        const passwordHash = await hash(password, 10);

        const user = await db.user.create({
            data: {
                email,
                passwordHash,
                firstName,
            },
        });

        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, user.id);
        await setSessionTokenCookie(sessionToken, session.expiresAt);

        return redirect("/");
    } catch (e) {
        if (isRedirectError(e)) throw e;
        console.error(e);
        return {
            error: "Something went wrong. Please try again",
        };
    }
}
