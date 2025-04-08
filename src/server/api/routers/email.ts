import {
    accountProtectionMiddleware,
    createTRPCRouter,
    privateProcedure,
} from "@/server/api/trpc";
import { type } from "arktype";
import { EmailAddress, OutGoingEmailAttachment } from "@/lib/email.types";
import { Account } from "@/server/db-queries/email/account";

export const emailRouter = createTRPCRouter({
    send: privateProcedure
        .input(
            type({
                accountId: "string>1",
                body: "string>1",
                subject: "string>1",
                from: EmailAddress,
                to: EmailAddress.array(),
                cc: EmailAddress.array().optional(),
                bcc: EmailAddress.array().optional(),
                replyTo: EmailAddress,
                attachments: OutGoingEmailAttachment.array().optional(),
            }),
        )
        .use(accountProtectionMiddleware)
        .mutation(async ({ ctx, input }) => {
            const account = new Account(ctx.account.accessToken);
            await account.sendEmail(input);
            await account.syncEmails();
        }),
    update: privateProcedure
        .input(
            type({
                accountId: "string>1",
                emails: type({
                    messageId: "string>0",
                    "unread?": "boolean|undefined",
                    "keywords?": "string[]|undefined",
                }).array(),
            }),
        )
        .use(accountProtectionMiddleware)
        .mutation(async ({ ctx, input }) => {
            const account = new Account(ctx.account.accessToken);
            await Promise.all(
                input.emails.map(async (email) => {
                    await account.updateEmailStatus(email);
                }),
            );
            const emails = await ctx.db.email.findMany({
                where: {
                    id: {
                        in: input.emails.map((email) => email.messageId),
                    },
                },
            });

            await Promise.all(
                input.emails.map(async (pd) => {
                    if (pd.unread === undefined) return;
                    const email = emails.find(
                        (email) => email.id === pd.messageId,
                    );
                    if (!email) return;

                    let sysLabels = [...email.sysLabels];
                    if (pd.unread) {
                        sysLabels = sysLabels.filter(
                            (label) => label.toLowerCase() !== "unread",
                        );
                    } else {
                        sysLabels = Array.from(
                            new Set([
                                ...sysLabels,
                                "unread",
                                ...(pd.keywords ?? []),
                            ]),
                        );
                    }

                    return ctx.db.email.update({
                        where: {
                            id: email.id,
                        },
                        data: {
                            sysLabels,
                        },
                    });
                }),
            );
        }),
});
