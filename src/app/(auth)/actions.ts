"use server";

import { redirect } from "next/navigation";
import {
    deleteSessionTokenCookie,
    invalidateSession,
    validateRequest,
} from "@/server/session";

export async function logout(): Promise<unknown> {
    const { session } = await validateRequest();

    if (!session) {
        throw new Error("Unauthorized");
    }

    await invalidateSession(session.id);
    await deleteSessionTokenCookie();
    return redirect("/sign-in");
}
