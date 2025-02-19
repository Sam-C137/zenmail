"use server";

import { OTPSchema, SignUpSchema } from "@/lib/validators";
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
import {
    sendEmailVerification,
    verifyEmailVerificationToken,
} from "@/server/db-queries/auth";

const emailSchema = SignUpSchema.pick("email");
export async function verifyEmail(
    credentials: typeof emailSchema.infer,
): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const data = emailSchema(credentials);
        if (data instanceof type.errors) {
            return {
                success: false,
                error: data.message,
            };
        }
        const { email } = data;
        const existingUser = await db.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return {
                success: false,
                error: "User already exists",
            };
        }

        const { success, error } = await sendEmailVerification(email);

        return {
            success,
            error,
        };
    } catch (e) {
        console.error(e);
        return {
            success: false,
            error: "Something went wrong. Please try again",
        };
    }
}

export async function confirmOtp(payload: typeof OTPSchema.infer): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const data = OTPSchema(payload);
        if (data instanceof type.errors) {
            return {
                success: false,
                error: data.message,
            };
        }

        const { email, code } = data;
        const { success, error } = await verifyEmailVerificationToken(
            email,
            code,
        );

        if (error) {
            return {
                success: false,
                error,
            };
        }

        return {
            success,
        };
    } catch (e) {
        console.error(e);
        return {
            success: false,
            error: "Something went wrong. Please try again",
        };
    }
}

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
