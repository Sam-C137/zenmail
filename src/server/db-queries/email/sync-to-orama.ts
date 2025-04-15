import type { EmailMessage } from "@/lib/email.types";
import { OramaClient } from "@/lib/orama";
import { genEmbedding } from "@/lib/embedding";
import { turndown } from "@/lib/turndown";

type Email = typeof EmailMessage.infer;
export async function syncEmailToOrama(email: Email, accountId: string) {
    try {
        const orama = new OramaClient(accountId);
        await orama.init();
        const embeddings = await genEmbedding(turndown.turndown(email.body));
        await orama.insert({
            subject: email.subject,
            from: email.from.address,
            to: email.to.map((to) => to.address),
            sentAt: email.sentAt,
            threadId: email.threadId,
            bodySnippet: email.bodySnippet,
            embeddings,
        });
    } catch (e) {
        console.error("Error syncing email to Orama:", e);
    }
}
