import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type } from "arktype";

export const postRouter = createTRPCRouter({
    hello: publicProcedure
        .input(type({ text: "string" }))
        .query(({ input }) => {
            return {
                greeting: `Hello ${input.text}`,
            };
        }),

    create: publicProcedure
        .input(type({ name: "string>1" }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.post.create({
                data: {
                    name: input.name,
                },
            });
        }),

    getLatest: publicProcedure.query(async ({ ctx }) => {
        const post = await ctx.db.post.findFirst({
            orderBy: { createdAt: "desc" },
        });

        return post ?? null;
    }),
});
