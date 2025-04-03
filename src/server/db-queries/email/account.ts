import "server-only";

import { aurinkoApi } from "@/lib/aurinko";
import { type } from "arktype";
import { sleep } from "@/lib/utils";
import {
    EmailAddress,
    EmailMessage,
    OutGoingEmailAttachment,
} from "@/lib/email.types";
import { db } from "@/server/db";
import { syncEmailsToDatabase } from "@/server/db-queries/email/sync-to-db";

export class Account {
    private readonly token: string;

    constructor(token: string) {
        this.token = token;
    }

    public async doInitialSync() {
        try {
            let data = await this.startSync({});
            while (!data.ready) {
                await sleep(1000);
                data = await this.startSync({});
            }

            let deltaToken = data.syncUpdatedToken;
            let response = await this.getUpdatedEmails({
                deltaToken,
            });
            if (response.nextDeltaToken) {
                deltaToken = response.nextDeltaToken;
            }

            let emails = Array.from(response.records);

            while (response.nextPageToken) {
                response = await this.getUpdatedEmails({
                    pageToken: response.nextPageToken,
                });
                emails = [...emails, ...response.records];
                if (response.nextDeltaToken) {
                    // sync ended
                    deltaToken = response.nextDeltaToken;
                }
            }

            console.log(
                "Initial sync completed, synced emails:",
                emails.length,
            );

            return { emails, deltaToken };
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Starts a new email sync
     * @param daysWithin
     * @param bodyType
     * @private
     */
    private async startSync({
        daysWithin = 15,
        bodyType = "html",
    }: Partial<typeof schemas.startSync.query.infer>) {
        const response = await aurinkoApi.post(
            "/email/sync",
            {},
            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
                params: {
                    daysWithin,
                    bodyType,
                },
            },
        );

        return schemas.startSync.response.assert(response.data);
    }

    /**
     * Request changed emails (deltas)
     * @private
     */
    private async getUpdatedEmails({
        deltaToken,
        pageToken,
    }: Partial<typeof schemas.getUpdatedEmails.query.infer>) {
        const response = await aurinkoApi.get("/email/sync/updated", {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
            params: {
                deltaToken,
                pageToken,
            },
        });

        return schemas.getUpdatedEmails.response.assert(response.data);
    }

    /**
     * Send an email
     * @param payload
     */
    public async sendEmail(payload: typeof schemas.sendEmail.mutation.infer) {
        const response = await aurinkoApi.post(
            "/email/messages",
            {
                ...payload,
                replyTo: [payload.replyTo],
                attachments: payload.attachments ?? [],
            },
            {
                params: {
                    returnIds: true,
                },
                headers: { Authorization: `Bearer ${this.token}` },
            },
        );

        return schemas.sendEmail.response.assert(response.data);
    }

    public async syncEmails() {
        const account = await db.account.findUnique({
            where: {
                accessToken: this.token,
            },
        });
        if (!account) {
            throw new Error("Account not found");
        }
        if (!account.nextDeltaToken) {
            throw new Error("No delta token found");
        }
        let savedToken = account.nextDeltaToken;
        let response = await this.getUpdatedEmails({
            deltaToken: account.nextDeltaToken,
        });
        if (response.nextDeltaToken) {
            savedToken = response.nextDeltaToken;
        }

        let emails = Array.from(response.records);
        while (response.nextPageToken) {
            response = await this.getUpdatedEmails({
                deltaToken: savedToken,
                pageToken: response.nextPageToken,
            });
            emails = [...emails, ...response.records];
            if (response.nextDeltaToken) {
                savedToken = response.nextDeltaToken;
            }
        }

        try {
            await syncEmailsToDatabase(emails, account.id);
        } catch (e) {
            console.error("Error syncing emails to database", e);
        }

        await db.account.update({
            where: {
                id: account.id,
            },
            data: {
                nextDeltaToken: savedToken,
            },
        });

        return {
            emails,
            deltaToken: savedToken,
        };
    }
}

const schemas = {
    startSync: {
        query: type({
            daysWithin: "number",
            bodyType: "'html'|'text'",
        }),
        response: type({
            syncUpdatedToken: "string",
            syncDeletedToken: "string",
            ready: "boolean",
        }),
    },
    getUpdatedEmails: {
        query: type({
            "deltaToken?": "string|null",
            "pageToken?": "string|null",
        }),
        response: type({
            "nextPageToken?": "string",
            nextDeltaToken: "string",
            length: "number",
            records: EmailMessage.array(),
        }),
    },
    sendEmail: {
        mutation: type({
            body: "string>1",
            subject: "string>1",
            from: EmailAddress,
            to: EmailAddress.array(),
            cc: EmailAddress.array().optional(),
            bcc: EmailAddress.array().optional(),
            replyTo: EmailAddress,
            attachments: OutGoingEmailAttachment.array().optional(),
            "inReplyTo?": "string|undefined",
            "references?": "string|undefined",
            "threadId?": "string|undefined",
        }),
        response: type({
            status: "'Ok'|string",
            id: "string",
            threadId: "string",
            processingStatus: "'Ok'|string",
            "trackingId?": "string|undefined",
            "processingError?": type({
                "failedSteps?": "string[]",
                "errorMessage?": "string|undefined",
            }),
        }),
    },
};
