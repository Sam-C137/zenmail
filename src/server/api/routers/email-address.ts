import {
    accountProtectionMiddleware,
    createTRPCRouter,
    privateProcedure,
} from "@/server/api/trpc";
import { type } from "arktype";

export const emailAddressRouter = createTRPCRouter({
    list: privateProcedure
        .input(
            type({
                accountId: "string",
                "query?": "string",
                "limit?": "number",
            }),
        )
        .use(accountProtectionMiddleware)
        .query(async ({ ctx, input }) => {
            return await ctx.db.emailAddress.findMany({
                where: {
                    accountId: ctx.account.id,
                    OR: [
                        {
                            address: {
                                contains: input.query,
                                mode: "insensitive",
                            },
                        },
                        {
                            name: {
                                contains: input.query,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
                select: {
                    address: true,
                    name: true,
                },
                take: input.limit ?? 10,
            });
        }),
});
