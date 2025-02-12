import "server-only";
import { GitHub, Google, MicrosoftEntraId } from "arctic";
import { env } from "@/env";

export const google = new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.NEXT_PUBLIC_URL}/api/auth/callback/google`,
);

export const github = new GitHub(
    env.GITHUB_CLIENT_ID,
    env.GITHUB_CLIENT_SECRET,
    null,
);

export const microsoft = new MicrosoftEntraId(
    env.MICROSOFT_CLIENT_TENANT_ID,
    env.MICROSOFT_CLIENT_ID,
    env.MICROSOFT_CLIENT_SECRET,
    `${env.NEXT_PUBLIC_URL}/api/auth/callback/microsoft`,
);
