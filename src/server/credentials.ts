import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { db } from "@/server/db";
import { compare } from "bcrypt";

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
