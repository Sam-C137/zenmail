import { type NextRequest, NextResponse } from "next/server";
import { validateSessionToken } from "@/server/session";
import {
    exchangeCodeForAccessToken,
    getAccountDetails,
} from "@/server/aurinko.actions";
import { db } from "@/server/db";

export async function GET(req: NextRequest) {
    const cookies = req.headers.get("set-cookie");
    const session = new Map(
        cookies?.split(";")?.map((c) => c.split("=")) as [string, string][],
    ).get("session");

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { user } = await validateSessionToken(session);

    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const params = req.nextUrl.searchParams;
    const status = params.get("status");
    if (status !== "success") {
        return NextResponse.json(
            { message: "Failed to link account" },
            { status: 401 },
        );
    }

    const code = params.get("code");
    if (!code) {
        return NextResponse.json(
            { message: "Code not found" },
            { status: 400 },
        );
    }

    const token = await exchangeCodeForAccessToken(code);
    if (!token) {
        return NextResponse.json(
            { message: "Failed to exchange code for token" },
            { status: 500 },
        );
    }

    const accountDetails = await getAccountDetails(token.accessToken);
    if (!accountDetails) {
        return NextResponse.json(
            { message: "Failed to get account details" },
            { status: 500 },
        );
    }

    try {
        const existingAccount = await db.account.findFirst({
            where: {
                emailAddress: accountDetails.email,
            },
        });

        if (existingAccount) {
            if (existingAccount.userId !== user.id) {
                return html(
                    "Email address already linked to another account",
                    false,
                );
            }

            await db.account.update({
                where: {
                    id: existingAccount.id,
                },
                data: {
                    accessToken: token.accessToken,
                    name: accountDetails.name,
                },
            });
            return html("", true);
        }

        await db.account.upsert({
            where: { id: token.accountId.toString() },
            update: {
                accessToken: token.accessToken,
            },
            create: {
                id: token.accountId.toString(),
                userId: user.id,
                emailAddress: accountDetails.email,
                name: accountDetails.name,
                accessToken: token.accessToken,
            },
        });
        return html("", true);
    } catch (e) {
        console.error(e);
        return html("Failed to link account", false);
    }
}

function html(message: string, success: boolean) {
    const redirectUrl = success ? "/mail" : "/error";
    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Authentication Result</title>
            </head>
            <body>
                <script>
                    window.onload = function() {
                        if (window.opener) {
                            window.opener.location.href = "${redirectUrl}";
                            window.close();
                        } else if (window.parent && window.parent !== window) {
                            window.parent.location.href = "${redirectUrl}";
                        } else {
                            window.location.href = "${redirectUrl}";
                        }
                    };
                </script>
                <p>${message}</p>
            </body>
        </html>
    `;

    return new NextResponse(html, {
        headers: {
            "Content-Type": "text/html",
        },
    });
}
