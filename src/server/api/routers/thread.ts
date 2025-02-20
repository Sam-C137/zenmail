import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { type } from "arktype";
import { t } from "@/server/api/trpc";

const protection = t.middleware(async ({ ctx, next, input }) => {
    const values = type({ accountId: "string>1" })(input);
    if (values instanceof type.errors) {
        throw new Error("Account id is required");
    }
    const account = await ctx.db.account.findFirst({
        where: {
            id: values.accountId,
            userId: ctx.user?.id,
        },
        select: {
            id: true,
            name: true,
            emailAddress: true,
            accessToken: true,
        },
    });
    if (!account) {
        throw new Error("Account does not exist");
    }
    return next({
        ctx: {
            ...ctx,
            account,
        },
        input,
    });
});

const threadsSchema = type({
    accountId: "string>1",
    type: "'trash' | 'sent' | 'inbox' | 'draft'",
});

export const threadRouter = createTRPCRouter({
    count: privateProcedure
        .input(threadsSchema)
        .use(protection)
        .query(async ({ ctx, input }) => {
            return await ctx.db.thread.count({
                where: {
                    NOT: {
                        isDeleted: input.type !== "trash",
                    },
                    accountId: ctx.account.id,
                    ...(input.type !== "trash" && {
                        ...(input.type === "inbox" && {
                            inboxStatus: true,
                        }),
                        ...(input.type === "draft" && {
                            draftStatus: true,
                        }),
                        ...(input.type === "sent" && {
                            sentStatus: true,
                        }),
                    }),
                },
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
        .use(protection)
        .query(async ({ ctx, input }) => {
            input.take = input.take ?? 15;
            const data = await ctx.db.thread.findMany({
                where: {
                    NOT: {
                        isDeleted: input.type !== "trash",
                    },
                    accountId: ctx.account.id,
                    ...(input.type !== "trash" && {
                        ...(input.type === "inbox" && {
                            inboxStatus: true,
                        }),
                        ...(input.type === "draft" && {
                            draftStatus: true,
                        }),
                        ...(input.type === "sent" && {
                            sentStatus: true,
                        }),
                    }),
                },
                include: {
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
                },
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
});
