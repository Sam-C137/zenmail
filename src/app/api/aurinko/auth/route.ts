import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const aurinkoUrl = "https://api.aurinko.io/v1/auth/callback";
    const queryString = req.nextUrl.search;
    const originalUrl = `${aurinkoUrl}${queryString}`;

    const type = req.nextUrl.searchParams.get("type");
    console.log("type of req is", type);

    const aurinkoRequest = new Request(originalUrl, {
        method: req.method,
        headers: req.headers,
        body: req.body,
        credentials: "include",
    });

    const aurinkoResponse = await fetch(aurinkoRequest);

    const responseBody = await aurinkoResponse.text();

    return new NextResponse(responseBody, {
        status: aurinkoResponse.status,
        headers: aurinkoResponse.headers,
    });
}
