import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
        DATABASE_URL: z.string().url(),
        NODE_ENV: z
            .enum(["development", "test", "production"])
            .default("development"),
        GOOGLE_CLIENT_ID: z.string().min(1),
        GOOGLE_CLIENT_SECRET: z.string().min(1),
        GITHUB_CLIENT_ID: z.string().min(1),
        GITHUB_CLIENT_SECRET: z.string().min(1),
        AURINKO_CLIENT_ID: z.string().min(1),
        AURINKO_CLIENT_SECRET: z.string().min(1),
        AURINKO_SIGNIN_SECRET: z.string().min(1),
        MICROSOFT_CLIENT_TENANT_ID: z.string().min(1),
        MICROSOFT_CLIENT_ID: z.string().min(1),
        MICROSOFT_CLIENT_SECRET: z.string().min(1),
        RESEND_API_KEY: z.string().min(1),
        GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
    },

    /**
     * Specify your client-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars. To expose them to the client, prefix them with
     * `NEXT_PUBLIC_`.
     */
    client: {
        NEXT_PUBLIC_URL: z.string().min(1),
    },

    /**
     * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
     * middlewares) or client-side so we need to destruct manually.
     */
    runtimeEnv: {
        NEXT_PUBLIC_URL: process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : process.env.NEXT_PUBLIC_URL,
        DATABASE_URL:
            process.env.NODE_ENV === "development"
                ? process.env.PROD_DATABASE_URL
                : process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
        MICROSOFT_CLIENT_TENANT_ID: process.env.MICROSOFT_CLIENT_TENANT_ID,
        MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
        MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        AURINKO_CLIENT_ID: process.env.AURINKO_CLIENT_ID,
        AURINKO_CLIENT_SECRET: process.env.AURINKO_CLIENT_SECRET,
        AURINKO_SIGNIN_SECRET: process.env.AURINKO_SIGNIN_SECRET,
        GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    },
    /**
     * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
     * useful for Docker builds.
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    /**
     * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
     * `SOME_VAR=''` will throw an error.
     */
    emptyStringAsUndefined: true,
});
