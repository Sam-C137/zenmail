import "server-only";
import { GitHub, Google } from "arctic";
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
