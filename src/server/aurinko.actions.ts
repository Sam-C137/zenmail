"use server";

import { env } from "@/env";
import { type } from "arktype";
import { validateRequest } from "@/server/session";
import { aurinkoApi } from "@/lib/aurinko";
import { redirect } from "next/navigation";

const ServiceTypes = type("'Google' | 'Office365' | 'Slack' | 'iCloud'");

export async function getAurinkoAuthUrl(
    serviceType: typeof ServiceTypes.infer,
) {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized");

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

    return `${aurinkoApi.defaults.baseURL}/auth/authorize?${params.toString()}`;
}

const codeExchangeSchema = type({
    accountId: "number",
    accessToken: "string",
    "userId?": "string",
    "userSession?": "string",
});
export async function exchangeCodeForAccessToken(code: string) {
    try {
        const response = await aurinkoApi.post(
            `/auth/token/${code}`,
            {},
            {
                auth: {
                    username: env.AURINKO_CLIENT_ID,
                    password: env.AURINKO_CLIENT_SECRET,
                },
            },
        );
        const data = codeExchangeSchema(response.data);
        if (data instanceof type.errors) {
            throw new Error(data.message);
        }
        return data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

const accountDetailsSchema = type({
    id: "number",
    serviceType: ServiceTypes,
    active: "boolean",
    tokenStatus: "'active'|'invalid'|'dead'",
    type: "'daemon'|'personal'|'managed'",
    email: "string",
    name: "string",
});
export async function getAccountDetails(accessToken: string) {
    try {
        const response = await aurinkoApi.get("/account", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data = accountDetailsSchema(response.data);
        if (data instanceof type.errors) {
            throw new Error(data.message);
        }
        return data;
    } catch (e) {
        console.error(e);
        return null;
    }
}
