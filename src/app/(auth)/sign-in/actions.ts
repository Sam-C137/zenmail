"use server";

import { SignInSchema } from "@/lib/validators";
import { type } from "arktype";
import { db } from "@/server/db";
import {
    createSession,
    generateSessionToken,
    setSessionTokenCookie,
} from "@/server/session";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { compare } from "bcrypt";

export async function verifyUser(email: string): Promise<
    | {
          success: true;
          email: string;
          userName: string;
      }
    | {
          success: false;
          error: string;
      }
> {
    try {
        const data = SignInSchema.pick("email")({ email });
        if (data instanceof type.errors) {
            return {
                success: false,
                error: data.message,
            };
        }

        const user = await db.user.findUnique({
            where: {
                email: data.email,
            },
        });

        if (!user) {
            return {
                success: false,
                error: "User not found",
            };
        }

        return {
            success: true,
            email: data.email,
            userName: user.firstName,
        };
    } catch (e) {
        console.error(e);
        return {
            success: false,
            error: "An error occurred",
        };
    }
}

export async function login(credentials: typeof SignInSchema.infer): Promise<{
    error: string;
}> {
    try {
        const data = SignInSchema(credentials);
        if (data instanceof type.errors) {
            return {
                error: data.message,
            };
        }

        const { email, password } = data;
        const user = await db.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return {
                error: "User not found",
            };
        }

        if (!user?.passwordHash) {
            return {
                error: "Please use your previous sign-in method",
            };
        }

        const isValidPassword = await compare(password, user.passwordHash);

        if (!isValidPassword) {
            return {
                error: "Invalid credentials",
            };
        }

        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, user.id);
        await setSessionTokenCookie(sessionToken, session.expiresAt);
        return redirect("/");
    } catch (e) {
        if (isRedirectError(e)) throw e;
        console.error(e);

        return {
            error: "Something went wrong. Please try again later",
        };
    }
}
