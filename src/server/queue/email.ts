import type { EmailMessage } from "@/lib/email.types";
import { db } from "@/server/db";
import { syncEmailsToDatabase } from "@/server/db-queries/email/sync-to-db";
import { Client } from "@upstash/qstash";
import { env } from "@/env";

const client = new Client({
    token: env.QSTASH_TOKEN,
});

export async function queueEmails(
    emails: (typeof EmailMessage.infer)[],
    accountId: string,
    deltaToken: string,
) {
    const batch = emails.slice(0, 10);
    const rem = emails.slice(10);

    await syncEmailsToDatabase(batch, accountId);

    await client.publishJSON({
        url: `${env.QSTASH_BASE_URL}/api/email/sync`,
        body: {
            emails: rem,
            accountId,
            deltaToken,
        },
        delay: "30s",
    });

    await client.publishJSON({
        url: `${env.QSTASH_BASE_URL}/api/email/orama/sync`,
        body: {
            emails,
            accountId,
        },
        delay: "30s",
    });

    await db.account.update({
        where: { id: accountId },
        data: { initialSyncStatus: "Partial" },
    });
}
