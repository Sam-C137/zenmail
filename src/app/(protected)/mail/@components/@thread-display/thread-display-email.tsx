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
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCallback } from "react";
import { ElementType } from "domelementtype";

interface ThreadDisplayEmailProps {
    email: RouterOutputs["thread"]["getThreads"]["data"][number]["emails"][number];
    single?: boolean;
}

export function ThreadDisplayEmail({ email, single }: ThreadDisplayEmailProps) {
    const { selectedAccount } = useAccount();
    const isMe = email.from.address === selectedAccount?.emailAddress;

    const renderHtml = useCallback(() => {
        return parse(
            DOMPurify.sanitize(email.body ?? "", {
                USE_PROFILES: { html: true },
            }),
            {
                replace(node) {
                    if (node.type === ElementType.Tag && node.name === "img") {
                        return (
                            <img
                                src={`/api/proxy?url=${node.attribs.src}`}
                                alt={node.attribs.alt}
                            />
                        );
                    }
                },
            },
        );
    }, [email.body]);

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
                <ScrollArea>
                    <ScrollBar orientation="vertical" />
                    {/*<div*/}
                    {/*    className="h-full overflow-auto"*/}
                    {/*    dangerouslySetInnerHTML={{*/}
                    {/*        __html: email.body ?? "",*/}
                    {/*    }}*/}
                    {/*></div>*/}
                    <table
                        role="presentation"
                        width="100%"
                        style={{ backgroundColor: "white" }}
                    >
                        <tbody>
                            <tr>
                                <td style={{ color: "black" }}>
                                    {renderHtml()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </ScrollArea>
            </AccordionContent>
        </AccordionItem>
    );
}
