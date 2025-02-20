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

export const threadRouter = createTRPCRouter({
    count: privateProcedure
        .input(
            type({
                accountId: "string>1",
                type: "'trash' | 'sent' | 'inbox' | 'draft'",
            }),
        )
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
});
