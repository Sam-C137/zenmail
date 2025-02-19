import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { type } from "arktype";

export const threadRouter = createTRPCRouter({
    count: privateProcedure
        .input(
            type({
                accountId: "string>1",
                type: "'trash' | 'sent' | 'inbox' | 'draft'",
            }),
        )
        .query(async ({ ctx, input }) => {
            const account = await ctx.db.account.findFirst({
                where: {
                    id: input.accountId,
                    userId: ctx.user.id,
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
            return await ctx.db.thread.count({
                where: {
                    NOT: {
                        isDeleted: input.type !== "trash",
                    },
                    accountId: account.id,
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
