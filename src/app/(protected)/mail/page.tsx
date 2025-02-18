import { validateRequest } from "@/server/session";
import { db } from "@/server/db";
import { Suspense } from "react";
import { Account } from "@/lib/account";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";

export default function MailPage() {
    return (
        <main>
            This is the mail page
            <Suspense fallback={"Please wait while we sync your account"}>
                <Sync />
            </Suspense>
        </main>
    );
}

async function Sync() {
    const { user } = await validateRequest();
    if (!user) return null;

    const userAccount = await db.account.findFirst({
        where: {
            userId: user.id,
        },
    });

    if (userAccount?.initialSyncStatus === "Pending") {
        try {
            const account = new Account(userAccount.accessToken);
            const response = await account.doInitialSync();

            if (!response) {
                console.error("Failed to trigger initial sync");
                return <>Failed to trigger initial sync</>;
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
            return <>Failed to trigger initial sync</>;
        }
    }

    return <>Your mail content here 🦍</>;
}
