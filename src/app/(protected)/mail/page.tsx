import { Suspense } from "react";
import React from "react";
import { InitialSync } from "./@components/initial-sync";
import { MailContent } from "./@components/mail-content";
import { InitialSyncErrorBoundary } from "./error";
import MailLoadingPage from "./loading";
import { validateRequest } from "@/server/session";
import { redirect } from "next/navigation";
import { db } from "@/server/db";

export default async function MailPage() {
    const { user } = await validateRequest();
    if (!user) return redirect("/sign-in");

    const userAccount = await db.account.findFirst({
        where: {
            userId: user.id,
        },
    });

    return (
        <main>
            <InitialSyncErrorBoundary>
                <Suspense
                    fallback={
                        <MailLoadingPage
                            isInitialSync={
                                userAccount?.initialSyncStatus === "Pending"
                            }
                        />
                    }
                >
                    <InitialSync userAccount={userAccount}>
                        <MailContent navCollapsedSize={4} />
                    </InitialSync>
                </Suspense>
            </InitialSyncErrorBoundary>
        </main>
    );
}
