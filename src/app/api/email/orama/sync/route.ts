import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { type } from "arktype";
import { EmailMessage } from "@/lib/email.types";
import { syncEmailToOrama } from "@/server/db-queries/email/sync-to-orama";
import { Client } from "@upstash/qstash";
import { env } from "@/env";

const client = new Client({
    token: env.QSTASH_TOKEN,
});

const schema = type({
    emails: EmailMessage.array(),
    accountId: "string>1",
});

export const POST = verifySignatureAppRouter(async (req: Request) => {
    try {
        const parsed = schema(await req.json());

        if (parsed instanceof type.errors) {
            return new Response(parsed.message, { status: 400 });
        }

        const { emails, accountId } = parsed;
        const batch = emails.slice(0, 10);
        const rem = emails.slice(10);

        for (const email of batch) {
            await syncEmailToOrama(email, accountId);
        }

        if (rem.length > 0) {
            await client.publishJSON({
                url: `${env.QSTASH_BASE_URL}/api/email/orama/sync`,
                body: {
                    emails: rem,
                    accountId,
                },
                delay: "30s",
            });
        }

        return new Response("Request processed successfully", { status: 200 });
    } catch (e) {
        console.error(e);
        return new Response("Internal Server Error", { status: 500 });
    }
});
