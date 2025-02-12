"use server";

import { type } from "arktype";
import { db } from "@/server/db";
import {
    isSamePassword,
    sendPasswordResetCode,
    verifyPasswordResetToken,
} from "@/server/credentials";
import { OTPSchema, ResetPasswordSchema } from "@/lib/validators";
import { hash } from "bcrypt";
import {
    createSession,
    generateSessionToken,
    invalidateUserSessions,
    setSessionTokenCookie,
} from "@/server/session";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const emailSchema = type({
    email: "string.email",
});
export async function requestPasswordReset(
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
        const user = await db.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return {
                success: false,
                error: "User not found",
            };
        }

        const { success, error } = await sendPasswordResetCode(user.id, email);

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

export async function verifyPasswordResetOtp(
    credentials: typeof OTPSchema.infer,
): Promise<{
    success: boolean;
    error?: string;
    userId?: number;
}> {
    try {
        const data = OTPSchema(credentials);
        if (data instanceof type.errors) {
            return {
                success: false,
                error: data.message,
            };
        }
        const { email, code } = data;
        const { success, error, userId } = await verifyPasswordResetToken(
            code,
            email,
        );

        if (!success) {
            return {
                success,
                error,
            };
        }

        return {
            success,
            userId,
        };
    } catch (e) {
        console.error(e);
        return {
            success: false,
            error: "Something went wrong. Please try again",
        };
    }
}

export async function resetPassword(
    credentials: typeof ResetPasswordSchema.infer,
) {
    try {
        const data = ResetPasswordSchema(credentials);
        if (data instanceof type.errors) {
            return {
                success: false,
                error: data.message,
            };
        }

        const { password, userId } = data;

        const samePassword = await isSamePassword(userId, password);
        if (samePassword) {
            return {
                success: false,
                error: "Your new password cannot be the same as your old password",
            };
        }

        const passwordHash = await hash(password, 10);
        await invalidateUserSessions(userId);

        await db.$transaction(async (tx) => {
            await tx.passwordResetToken.deleteMany({
                where: {
                    userId,
                },
            });
            await tx.user.update({
                where: {
                    id: userId,
                },
                data: {
                    passwordHash,
                },
            });
        });

        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, userId);
        await setSessionTokenCookie(sessionToken, session.expiresAt);

        return redirect("/");
    } catch (e) {
        if (isRedirectError(e)) throw e;
        console.error(e);
        return {
            success: false,
            error: "Something went wrong. Please try again",
        };
    }
}
