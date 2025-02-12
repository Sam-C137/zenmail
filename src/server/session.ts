import "server-only";

import type { Session, User } from "@prisma/client";
import {
    encodeBase32LowerCaseNoPadding,
    encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { db } from "@/server/db";
import { cookies } from "next/headers";
import { cache } from "react";

const WEEK = 1000 * 60 * 60 * 24 * 7;
const HALF_WEEK = WEEK / 2;

export function generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    return encodeBase32LowerCaseNoPadding(bytes);
}

export async function createSession(
    token: string,
    userId: number,
): Promise<Session> {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token)),
    );
    const session: Session = {
        id: sessionId,
        userId,
        // 1 week
        expiresAt: new Date(Date.now() + WEEK),
    };
    await db.session.create({
        data: session,
    });
    return session;
}

export async function validateSessionToken(
    token: string,
): Promise<SessionValidationResult> {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token)),
    );
    const result = await db.session.findUnique({
        where: {
            id: sessionId,
        },
        include: {
            user: true,
        },
    });

    if (result === null) {
        return { session: null, user: null };
    }

    const { user, ...session } = result;

    if (Date.now() >= session.expiresAt.getTime()) {
        await db.session.delete({ where: { id: sessionId } });
        return { session: null, user: null };
    }

    if (Date.now() >= session.expiresAt.getTime() - HALF_WEEK) {
        session.expiresAt = new Date(Date.now() + WEEK);
        await db.session.update({
            where: {
                id: session.id,
            },
            data: {
                expiresAt: session.expiresAt,
            },
        });
    }
    return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
    await db.session.delete({ where: { id: sessionId } });
}

export async function invalidateUserSessions(userId: number): Promise<void> {
    await db.session.deleteMany({ where: { userId } });
}

export type SessionValidationResult =
    | { session: Session; user: User }
    | { session: null; user: null };

/**
 * client
 */
export async function setSessionTokenCookie(
    token: string,
    expiresAt: Date,
): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        path: "/",
    });
}

export async function deleteSessionTokenCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set("session", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
    });
}

export const validateRequest = cache(
    async (): Promise<SessionValidationResult> => {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value ?? null;
        if (token === null) {
            return { session: null, user: null };
        }
        return await validateSessionToken(token);
    },
);
