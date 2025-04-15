import { create, insert, search, type AnyOrama } from "@orama/orama";
import { db } from "@/server/db";
import { persist, restore } from "@orama/plugin-data-persistence";
import { type } from "arktype";
import { genEmbedding } from "@/lib/embedding";

export class OramaClient {
    private orama?: AnyOrama;
    private readonly accountId: string;

    constructor(accountId: string) {
        this.accountId = accountId;
    }

    public async init() {
        const account = await db.account.findFirst({
            where: {
                id: this.accountId,
            },
        });

        if (!account) {
            throw new Error("Account not found");
        }

        if (account.binaryIndex) {
            this.orama = await restore("json", account.binaryIndex as string);
        } else {
            this.orama = create({
                schema: {
                    subject: "string",
                    from: "string",
                    to: "string[]",
                    sentAt: "string",
                    /**
                     * removed to avoid slow insert and search, but inserts should include it
                     * threadId: "string"
                     */
                    bodySnippet: "string",
                    embeddings: "vector[3072]",
                },
            });
            await this.saveIndex();
        }
    }

    private async saveIndex() {
        if (!this.orama) throw new Error("Orama client not initialized");
        const index = await persist(this.orama, "json");
        await db.account.update({
            where: {
                id: this.accountId,
            },
            data: {
                binaryIndex: index,
            },
        });
    }

    public async search(term: string) {
        if (!this.orama) throw new Error("Orama client not initialized");
        return search(this.orama, {
            term,
        });
    }

    public async vectorSearch(term: string) {
        if (!this.orama) throw new Error("Orama client not initialized");
        const embeddings = await genEmbedding(term);
        return search(this.orama, {
            term,
            mode: "hybrid",
            vector: {
                value: embeddings ?? [],
                property: "embeddings",
            },
            similarity: 0.8,
            limit: 10,
        });
    }

    public async insert(doc: typeof docSchema.infer) {
        if (!this.orama) throw new Error("Orama client not initialized");
        docSchema.assert(doc);
        await insert(this.orama, doc);
        await this.saveIndex();
    }
}

const docSchema = type({
    subject: "string",
    from: "string",
    to: "string[]",
    sentAt: "string",
    threadId: "string",
    bodySnippet: "string",
    "embeddings?": "number[]|undefined",
});
