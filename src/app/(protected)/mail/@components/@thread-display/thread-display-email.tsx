"use client";

import type { RouterOutputs } from "@/trpc/react";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "@/hooks/api/use-account";
import { cn } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";
import { useMemo } from "react";

interface ThreadDisplayEmailProps {
    email: RouterOutputs["thread"]["getThread"]["emails"][number];
    single?: boolean;
}

export function ThreadDisplayEmail({ email, single }: ThreadDisplayEmailProps) {
    const { selectedAccount } = useAccount();
    const isMe = email.from.address === selectedAccount?.emailAddress;

    const { isImageEmail, isPlainTextEmail, sanitizedContent } = useMemo(() => {
        const html = DOMPurify.sanitize(email.body ?? "", {
            USE_PROFILES: { html: true },
        });

        const doc = new DOMParser().parseFromString(html, "text/html");
        const imageCount = doc.querySelectorAll("img").length;

        const textContent = doc.body.innerText.trim();
        const textLength = textContent.length;

        // This is primarily an image email (>5% of content are images, and there's at least one image)
        const isImageEmail =
            imageCount > 0 &&
            (textLength === 0 || imageCount / textLength > 0.05);

        // Common patterns of plain text emails styled as HTML
        const hasComplexHtml =
            doc.querySelectorAll(
                "table:not(.plain-text-wrapper), iframe, video, canvas",
            ).length > 0;

        /**
         * @description Common patterns in text-based emails from various providers
         */
        const commonTextPatterns = [
            // Outlook/office-style text emails (with classes like elementToProof)
            doc.querySelectorAll("div.elementToProof").length > 0,

            // Simple div structure with inline styles setting color/font
            Array.from(doc.querySelectorAll("div")).some(
                (div) =>
                    div.getAttribute("style")?.includes("color:") &&
                    div.getAttribute("style")?.includes("font-family:"),
            ),

            // Sequential paragraphs with minimal styling
            doc.querySelectorAll("p").length > 0 &&
                doc.querySelectorAll("div").length < 5 &&
                doc.querySelectorAll("img, table, iframe").length === 0,

            // Gmail-style structured but plain emails
            doc.querySelectorAll("div[dir='ltr']").length > 0 &&
                doc.querySelectorAll("img").length === 0,

            // Simple body with just paragraphs or line breaks
            doc.body.children.length < 10 &&
                Array.from(doc.body.children).every(
                    (el) =>
                        el.tagName === "P" ||
                        el.tagName === "DIV" ||
                        el.tagName === "BR",
                ),
        ];

        const isPlainTextEmail =
            !isImageEmail &&
            !hasComplexHtml &&
            commonTextPatterns.some((pattern) => pattern);

        let processedContent = html;

        if (isPlainTextEmail) {
            const paragraphs = textContent
                .split(/\n\s*\n/)
                .filter((p) => p.trim().length > 0);

            const formattedHtml = paragraphs
                .map((p) => {
                    const formattedParagraph = p.replace(/\n/g, "<br>").trim();

                    return `<p class="email-paragraph">${formattedParagraph}</p>`;
                })
                .join("\n");

            processedContent = `<div class="email-text-content">${formattedHtml}</div>`;
        }

        return {
            isImageEmail,
            isPlainTextEmail,
            sanitizedContent: processedContent,
        };
    }, [email.body]);

    const emailStyles = `
        .email-text-content p.email-paragraph {
            margin-bottom: 1em;
            line-height: 1.5;
        }
        .email-text-content p.email-paragraph:last-child {
            margin-bottom: 0;
        }
    `;

    return (
        <AccordionItem value={email.id} className={single ? "h-full" : ""}>
            <AccordionTrigger
                disabled={single}
                className="group hover:no-underline py-0"
            >
                <div
                    className={cn("flex items-start p-4 w-full", {
                        "border-l-4 border-l-foreground": isMe,
                    })}
                >
                    <div className="flex items-start gap-4 text-sm">
                        <Avatar>
                            <AvatarImage
                                alt={
                                    isMe
                                        ? "Me"
                                        : (email.from.name ?? "Unknown Sender")
                                }
                            />
                            <AvatarFallback>
                                {isMe
                                    ? "M"
                                    : (email.from.name
                                          ?.split(" ")
                                          .map((chunk) => chunk[0])
                                          .join("")
                                          .toUpperCase() ?? "U")}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                            <div className="font-semibold">
                                {isMe
                                    ? "Me"
                                    : (email.from.name ?? "Unknown Sender")}
                            </div>
                            <div className="line-clamp-1 text-xs">
                                {email.subject}
                            </div>
                            <div
                                className={cn(
                                    "line-clamp-1 text-xs",
                                    isMe && "hidden",
                                )}
                            >
                                <span className="font-medium">Reply-To:</span>{" "}
                                {email.from.address}
                            </div>
                        </div>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">
                        {format(new Date(email.sentAt), "PPpp")}
                    </div>
                </div>
            </AccordionTrigger>
            <Separator className="group-data-[state=closed]:opacity-0" />
            <AccordionContent className="p-6 flex flex-col gap-4">
                {isPlainTextEmail && <style>{emailStyles}</style>}
                <div
                    dangerouslySetInnerHTML={{
                        __html: sanitizedContent,
                    }}
                    className={cn("bg-white text-black", {
                        "bg-white text-black": isImageEmail,
                        "bg-background text-foreground": isPlainTextEmail,
                    })}
                ></div>
            </AccordionContent>
        </AccordionItem>
    );
}
