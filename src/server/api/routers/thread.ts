import {
    accountProtectionMiddleware,
    createTRPCRouter,
    privateProcedure,
} from "@/server/api/trpc";
import { type } from "arktype";
import { type Prisma } from "@prisma/client";
import { EmailAddress, OutGoingEmailAttachment } from "@/lib/email.types";
import { Account } from "@/server/db-queries/email/account";

const threadsSchema = type({
    accountId: "string>1",
    type: "'trash' | 'sent' | 'inbox' | 'draft' | 'starred'",
});

const threadInclude = {
    emails: {
        orderBy: {
            sentAt: "asc",
        },
        select: {
            from: true,
            body: true,
            bodySnippet: true,
            emailLabel: true,
            subject: true,
            sysLabels: true,
            id: true,
            sentAt: true,
        },
    },
} satisfies Prisma.ThreadInclude;

const threadWhere = (
    type: (typeof threadsSchema.infer)["type"],
    accountId: string,
) => {
    return {
        NOT: {
            isDeleted: type !== "trash",
        },
        accountId,
        ...(type !== "trash" && {
            ...(type === "inbox" && {
                inboxStatus: true,
            }),
            ...(type === "draft" && {
                draftStatus: true,
            }),
            ...(type === "sent" && {
                sentStatus: true,
            }),
        }),
        ...(type === "starred" && {
            isStarred: true,
        }),
    } satisfies Prisma.ThreadWhereInput;
};

export const threadRouter = createTRPCRouter({
    count: privateProcedure
        .input(threadsSchema)
        .use(accountProtectionMiddleware)
        .query(async ({ ctx, input }) => {
            return await ctx.db.thread.count({
                where: threadWhere(input.type, ctx.account.id),
            });
        }),
    getThreads: privateProcedure
        .input(
            type({
                "...": threadsSchema,
                "cursor?": threadsSchema.get("accountId"),
                "take?": type("undefined|number>0"),
                done: "boolean=false",
            }),
        )
        .use(accountProtectionMiddleware)
        .query(async ({ ctx, input }) => {
            input.take = input.take ?? 15;
            const data = await ctx.db.thread.findMany({
                where: threadWhere(input.type, ctx.account.id),
                include: threadInclude,
                take: input.take + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                orderBy: {
                    lastMessageDate: "desc",
                },
            });

            return {
                data: data.slice(0, input.take),
                done: data.length <= input.take,
                nextCursor:
                    data.length > input.take ? data[data.length - 1]?.id : null,
            };
        }),
    getReplyDetails: privateProcedure
        .input(
            type({
                "...": threadsSchema.pick("accountId"),
                threadId: "string>1",
                replyType: "'reply' | 'replyAll'",
            }),
        )
        .use(accountProtectionMiddleware)
        .query(async ({ ctx, input }) => {
            const thread = await ctx.db.thread.findUnique({
                where: { id: input.threadId },
                include: {
                    emails: {
                        orderBy: { sentAt: "asc" },
                        select: {
                            from: true,
                            to: true,
                            cc: true,
                            bcc: true,
                            sentAt: true,
                            subject: true,
                            internetMessageId: true,
                        },
                    },
                },
            });

            if (!thread || thread.emails.length === 0) {
                throw new Error("Thread not found or empty");
            }

            const lastExternalEmail = thread.emails
                .reverse()
                .find((email) => email.from.id !== ctx.account.id);

            if (!lastExternalEmail) {
                throw new Error("No external email found in thread");
            }

            if (input.replyType === "reply") {
                return {
                    to: [lastExternalEmail.from],
                    cc: [],
                    from: {
                        name: ctx.account.name,
                        address: ctx.account.emailAddress,
                    },
                    subject: `${lastExternalEmail.subject}`,
                    internetMessageId: lastExternalEmail.internetMessageId,
                };
            } else if (input.replyType === "replyAll") {
                return {
                    to: [
                        lastExternalEmail.from,
                        ...lastExternalEmail.to.filter(
                            (addr) => addr.id !== ctx.account.id,
                        ),
                    ],
                    cc: lastExternalEmail.cc.filter(
                        (addr) => addr.id !== ctx.account.id,
                    ),
                    from: {
                        name: ctx.account.name,
                        address: ctx.account.emailAddress,
                    },
                    subject: `${lastExternalEmail.subject}`,
                    internetMessageId: lastExternalEmail.internetMessageId,
                };
            }
        }),
    reply: privateProcedure
        .input(
            type({
                "...": threadsSchema.pick("accountId"),
                body: "string>1",
                subject: "string>1",
                from: EmailAddress,
                to: EmailAddress.array(),
                cc: EmailAddress.array().optional(),
                bcc: EmailAddress.array().optional(),
                replyTo: EmailAddress,
                attachments: OutGoingEmailAttachment.array().optional(),
                "inReplyTo?": "string|undefined",
                "threadId?": "string|undefined",
            }),
        )
        .use(accountProtectionMiddleware)
        .mutation(async ({ ctx, input }) => {
            console.log(input);
            return;
            const account = new Account(ctx.account.id);
            await account.sendEmail(input);
        }),
});
