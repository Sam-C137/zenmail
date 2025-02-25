import { type NextRequest, NextResponse } from "next/server";
import { type } from "arktype";

export async function GET(req: NextRequest) {
    const reqUrl = new URL(req.url);
    const url = type("string.url")(reqUrl.searchParams.get("url"));
    if (url instanceof type.errors) {
        return NextResponse.json(
            {
                error: "Invalid URL " + url.message,
            },
            {
                status: 400,
            },
        );
    }

    try {
        const response = await fetch(url);
        const contentType = response.headers.get("content-type");
        if (!contentType?.startsWith("image/")) {
            return NextResponse.json(
                {
                    error: "Invalid image",
                },
                {
                    status: 400,
                },
            );
        }
        const buffer = await response.arrayBuffer();

        return new Response(buffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400, s-maxage=86400",
            },
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            {
                error: "Failed to fetch image",
            },
            {
                status: 400,
            },
        );
    }
}
