import "server-only";

import { aurinkoApi } from "@/lib/aurinko";
import { type } from "arktype";
import { sleep } from "@/lib/utils";
import { EmailAddress, EmailMessage } from "@/lib/email.types";

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
    }: Partial<typeof this.schemas.startSync.query.infer>) {
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

        return this.schemas.startSync.response.assert(response.data);
    }

    /**
     * Request changed emails (deltas)
     * @private
     */
    private async getUpdatedEmails({
        deltaToken,
        pageToken,
    }: Partial<typeof this.schemas.getUpdatedEmails.query.infer>) {
        const response = await aurinkoApi.get("/email/sync/updated", {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
            params: {
                deltaToken,
                pageToken,
            },
        });

        return this.schemas.getUpdatedEmails.response.assert(response.data);
    }

    /**
     * Send an email
     * @param payload
     */
    public async sendEmail(
        payload: typeof this.schemas.sendEmail.mutation.infer,
    ) {
        const response = await aurinkoApi.post(
            "/email/messages",
            {
                from: payload.from,
                subject: payload.subject,
                body: payload.body,
                inReplyTo: payload.inReplyTo,
                references: payload.references,
                threadId: payload.threadId,
                to: payload.to,
                cc: payload.cc,
                bcc: payload.bcc,
                replyTo: [payload.replyTo],
            },
            {
                params: {
                    returnIds: true,
                },
                headers: { Authorization: `Bearer ${this.token}` },
            },
        );

        console.log("sendmail", response.data);
        // return response.data;
    }

    private schemas = {
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
                "inReplyTo?": "string|undefined",
                "references?": "string|undefined",
                "threadId?": "string|undefined",
            }),
        },
    };
}
