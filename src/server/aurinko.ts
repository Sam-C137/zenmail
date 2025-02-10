"use server";

// import { auth } from "@clerk/nextjs/server";
import { env } from "@/env";
import { type } from "arktype";

const ServiceTypes = type("'Google' | 'Office365' | 'Slack' | 'iCloud'");

export async function getAurinkoAuthUrl(
    serviceType: typeof ServiceTypes.infer,
) {
    // const { userId } = await auth();
    // if (!userId) throw new Error("Unauthorized");

    const s = ServiceTypes(serviceType);

    if (s instanceof type.errors) {
        throw new Error(s.message);
    }

    const params = new URLSearchParams({
        clientId: env.AURINKO_CLIENT_ID,
        serviceType,
        scopes: "Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All",
        responseType: "code",
        returnUrl: env.NEXT_PUBLIC_URL + "/api/aurinko/callback",
    });

    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
}
