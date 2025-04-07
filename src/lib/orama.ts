import { create, insert, search, type AnyOrama } from "@orama/orama";
import { db } from "@/server/db";
import { persist, restore } from "@orama/plugin-data-persistence";
import { type } from "arktype";

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
                    body: "string",
                    raw: "string",
                    from: "string",
                    to: "string[]",
                    sentAt: "string",
                    threadId: "string",
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

    public async insert(doc: typeof docSchema.infer) {
        if (!this.orama) throw new Error("Orama client not initialized");
        docSchema.assert(doc);
        await insert(this.orama, doc);
        await this.saveIndex();
    }
}

const docSchema = type({
    subject: "string",
    body: "string",
    from: "string",
    to: "string[]",
    sentAt: "string",
    threadId: "string",
});
