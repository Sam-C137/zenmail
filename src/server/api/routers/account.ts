import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";

export const accountRouter = createTRPCRouter({
    getAccounts: privateProcedure.query(async ({ ctx }) => {
        return await ctx.db.account.findMany({
            where: { userId: ctx.user.id },
            select: {
                id: true,
                emailAddress: true,
                name: true,
            },
        });
    }),
});
