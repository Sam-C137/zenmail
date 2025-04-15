import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { Client } from "@upstash/qstash";
import { env } from "@/env";
import { type } from "arktype";
import { EmailMessage } from "@/lib/email.types";
import { syncEmailsToDatabase } from "@/server/db-queries/email/sync-to-db";
import { db } from "@/server/db";

const client = new Client({
    token: env.QSTASH_TOKEN,
});

const schema = type({
    emails: EmailMessage.array(),
    accountId: "string>1",
    deltaToken: "string>1",
});

export const POST = verifySignatureAppRouter(async (req: Request) => {
    try {
        const parsed = schema(await req.json());

        if (parsed instanceof type.errors) {
            return new Response(parsed.message, { status: 400 });
        }

        const { emails, accountId, deltaToken } = parsed;
        const batch = emails.slice(0, 20);
        const rem = emails.slice(20);
        await syncEmailsToDatabase(batch, accountId);

        if (rem.length > 0) {
            await client.publishJSON({
                url: `${env.QSTASH_BASE_URL}/api/email/sync`,
                body: {
                    emails: rem,
                    accountId,
                    deltaToken,
                },
                delay: "30s",
            });
        }

        if (batch.length < 20) {
            await db.$transaction(async (tx) => {
                const userAccount = await tx.account.update({
                    where: { id: accountId },
                    data: { initialSyncStatus: "Completed" },
                    select: {
                        accessToken: true,
                    },
                });
                await tx.account.update({
                    where: {
                        accessToken: userAccount.accessToken,
                    },
                    data: {
                        nextDeltaToken: deltaToken,
                    },
                });
            });
        }

        return new Response("Request processed successfully", { status: 200 });
    } catch (e) {
        console.error(e);
        return new Response("Internal Server Error", { status: 500 });
    }
});
