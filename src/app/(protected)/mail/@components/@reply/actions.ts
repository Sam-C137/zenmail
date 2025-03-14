"use server";

import { generateText, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { type } from "arktype";

const generateEmailSchema = type({
    context: "string",
    prompt: "string>0",
});

export async function generateEmail({
    context,
    prompt,
}: typeof generateEmailSchema.infer): Promise<
    | {
          output: ReadableStream<Uint8Array>;
          error: null;
      }
    | {
          output: null;
          error: string;
      }
> {
    try {
        if (
            generateEmailSchema({
                context,
                prompt,
            }) instanceof type.errors
        ) {
            return {
                output: null,
                error: "Missing prompt or context",
            };
        }

        const response = streamText({
            model: google("gemini-2.0-flash-lite-preview-02-05"),
            prompt: `
            You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by providing suggestions and relevant information based on the context of their previous emails.
            
            THE TIME NOW IS ${new Date().toLocaleString()}
            
            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK
            
            USER PROMPT:
            ${prompt}
            
            When responding, please keep in mind:
            - Be helpful, clever, and articulate. 
            - Rely on the provided email context to inform your response.
            - If the context does not contain enough information to fully address the prompt, politely give a draft response.
            - The context may contain html tags, please ignore them and safe parse the text you need.
            - If the context for previous emails appears to be empty, ignore it and focus on the user prompt treat your response as the first email in the thread.
            - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
            - Do not invent or speculate about anything that is not directly supported by the email context.
            - Keep your response focused and relevant to the user's prompt.
            - Don't add fluff like 'Here's your email' or anything like that just go straight to the point.
            - Directly output the email, no need to say 'Here is your email' or 'Understood' you can think of yourself as a pure function which just spits out email body.
            - No need to output subject lines, just the body of the email.
            - When giving a draft response avoid telling the user about lack of context or any apologetic behavior, ignore the context and focus on returning pure email body that can be sent right away.
            `,
        });

        return { output: response.toDataStream(), error: null };
    } catch (e) {
        console.error(e);
        return { output: null, error: "An error occurred" };
    }
}
