import { db } from "@/server/db";
import { Account } from "@/server/db-queries/email/account";
import { syncEmailsToDatabase } from "@/server/db-queries/email/sync-to-db";
import { type Account as Account$ } from "@prisma/client";
import React from "react";

interface InitialSyncProps {
    userAccount: Account$ | null;
}

export async function InitialSync({
    children,
    userAccount,
}: React.PropsWithChildren & InitialSyncProps) {
    if (userAccount?.initialSyncStatus === "Pending") {
        try {
            const account = new Account(userAccount.accessToken);
            const response = await account.doInitialSync();

            if (!response) {
                console.error("Failed to trigger initial sync");
                return null;
            }

            const result = await syncEmailsToDatabase(
                response.emails,
                userAccount.id,
            );
            if (result !== null) {
                await db.account.update({
                    where: {
                        accessToken: userAccount.accessToken,
                    },
                    data: {
                        nextDeltaToken: response.deltaToken,
                    },
                });
            }
        } catch (e) {
            console.error("Failed to trigger initial sync", e);
            return (
                <main className="grid h-screen place-items-center font-semibold">
                    Failed to sync your account. Please try again.
                </main>
            );
        }
    }

    return <>{children}</>;
}
