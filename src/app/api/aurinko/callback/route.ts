import { type NextRequest, NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    console.log("req came in", req.url);
    // const { userId } = await auth();
    // console.log("User id is ", userId);
    return NextResponse.json({ message: "Hello World" });
}
