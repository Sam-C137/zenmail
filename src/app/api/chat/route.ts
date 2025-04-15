import { validateRequest } from "@/server/session";
import { NextResponse } from "next/server";
import { type } from "arktype";
import { OramaClient } from "@/lib/orama";
import { db } from "@/server/db";
import { turndown } from "@/lib/turndown";
import { google } from "@ai-sdk/google";
import { type CoreMessage, streamText } from "ai";

export async function POST(req: Request) {
    try {
        const { user } = await validateRequest();
        if (!user) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                { status: 401 },
            );
        }
        const body = (await req.json()) as {
            accountId: string;
            messages: CoreMessage[];
        };
        const { accountId, messages } = body;
        const orama = new OramaClient(accountId);
        await orama.init();
        const lastMessage = messages[messages.length - 1];
        if (lastMessage) {
            const term = lastMessage.content;
            type("string").assert(term);
            const context = await orama.vectorSearch(term as string);
            console.log(context.hits.length + " hits found");
            const threadIds = context.hits.map(
                (hit) => hit.document.threadId as string,
            );
            const emails = await db.email.findMany({
                where: {
                    threadId: { in: threadIds },
                },
                select: {
                    from: {
                        select: {
                            address: true,
                            name: true,
                        },
                    },
                    bodySnippet: true,
                    subject: true,
                    emailLabel: true,
                    sentAt: true,
                    sysLabels: true,
                    body: true,
                },
            });

            return streamText({
                model: google("gemini-2.0-flash-lite-preview-02-05"),
                system: `
                    You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, 
                    providing suggestions, and offering relevant information based on the context of their previous emails.
                    
                    THE TIME NOW IS ${new Date().toLocaleString()}
          
                    START CONTEXT BLOCK
                    ${emails
                        .map((email) =>
                            JSON.stringify({
                                ...email,
                                body: turndown.turndown(email.body ?? ""),
                                sentAt: new Date(email.sentAt).toLocaleString(),
                            }),
                        )
                        .join("\n")}
                    END OF CONTEXT BLOCK
                      
                    When responding, please keep in mind:
                    - Be helpful, clever, and articulate.
                    - Rely on the provided email context to inform your responses.
                    - If the context does not contain enough information to answer a question, politely say you don't have enough information.
                    - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
                    - Do not invent or speculate about anything that is not directly supported by the email context.
                    - Keep your responses concise and relevant to the user's questions or the email being composed.`,
                messages,
                onFinish() {
                    console.log("Ai generation done");
                },
            }).toDataStreamResponse();
        }
        return NextResponse.json(
            {
                foo: "bar",
            },
            {
                status: 200,
            },
        );
    } catch (e) {
        console.error("Error in chat route:", e);
        return NextResponse.json(
            {
                error: "Internal server error",
            },
            { status: 500 },
        );
    }
}
