import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { db } from "@/server/db";
import { compare, hash } from "bcrypt";
import { resend } from "@/server/resend";
import AccountVerificationEmail from "@/components/emails/account-verification-email";

/**
 * RESET PASSWORD
 */
export async function createPasswordResetToken(
    userId: number,
): Promise<string> {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const tokenId = encodeBase32LowerCaseNoPadding(bytes);

    await db.$transaction(async (tx) => {
        await tx.passwordResetToken.deleteMany({
            where: {
                userId,
            },
        });

        await tx.passwordResetToken.create({
            data: {
                id: tokenId,
                userId,
                expiresAt: new Date(Date.now() + 1000 * 60 * 15),
            },
        });
    });

    return tokenId;
}

export async function verifyPasswordResetToken(
    tokenId: string,
): Promise<{ success: boolean; message?: string; userId?: number }> {
    const resetToken = await db.passwordResetToken.findUnique({
        where: {
            id: tokenId,
        },
    });

    if (!resetToken || resetToken.id !== tokenId) {
        return {
            success: false,
            message:
                "Password reset token is invalid, please request a new one",
        };
    }

    if (resetToken.expiresAt < new Date()) {
        return {
            success: false,
            message:
                "Password reset token has expired, please request a new one",
        };
    }

    if (resetToken) {
        await db.passwordResetToken.delete({
            where: { id: tokenId },
        });
    }

    return {
        success: true,
        userId: resetToken.userId,
    };
}

export async function isSamePassword(
    userId: number,
    password: string,
): Promise<boolean> {
    const user = await db.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user?.passwordHash) {
        return false;
    }

    return compare(password, user.passwordHash);
}

/**
 *  REGISTER
 */
export async function sendEmailVerification(email: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashed = await hash(otp, 10);

    await db.emailVerificationToken.deleteMany({
        where: { email },
    });

    await db.emailVerificationToken.create({
        data: {
            email,
            otp: hashed,
            expiresAt,
        },
    });

    const { error } = await resend.emails.send({
        from: "zenmail <zenmail@mail.sam-c137.space>",
        to: [email],
        subject: "Email Verification",
        react: AccountVerificationEmail({ code: otp }),
    });

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    return {
        success: true,
    };
}

export async function verifyEmailVerificationToken(
    email: string,
    submittedOtp: string,
): Promise<{ success: boolean; error?: string }> {
    const tokenRecord = await db.emailVerificationToken.findUnique({
        where: { email },
    });

    if (!tokenRecord) {
        return { success: false, error: "No OTP found for this email." };
    }

    if (tokenRecord.expiresAt < new Date()) {
        await db.emailVerificationToken.delete({
            where: { email },
        });
        return {
            success: false,
            error: "OTP has expired. Please request a new one.",
        };
    }

    const isValidOtp = await compare(submittedOtp, tokenRecord.otp);

    if (!isValidOtp) {
        return { success: false, error: "Invalid OTP. Please try again." };
    }

    await db.emailVerificationToken.delete({
        where: { email },
    });

    return { success: true };
}
