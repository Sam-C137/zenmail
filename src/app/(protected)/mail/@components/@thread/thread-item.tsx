import type { RouterOutputs } from "@/trpc/react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "dompurify";
import { useMemo } from "react";
import { Mail, MailOpen, Trash2Icon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, type Variants } from "framer-motion";
import * as React from "react";
import { Button } from "@/components/ui/button";

interface ThreadItemProps {
    thread: RouterOutputs["thread"]["getThreads"]["data"][number];
    shouldShowDate: boolean;
    isActive?: boolean;
    setIsActive?: (threadId: string) => void;
    isSelected?: boolean;
    setIsSelected?: (threadId: string) => void;
    onDelete?: (id: string) => void;
    onMarkAsRead?: (id: string) => void;
    onMarkAsUnread?: (id: string) => void;
    isDeleting?: boolean;
}

export const ThreadItem = React.forwardRef<HTMLDivElement, ThreadItemProps>(
    (
        {
            thread,
            shouldShowDate,
            isActive,
            isSelected,
            setIsActive,
            setIsSelected,
            onDelete,
            isDeleting,
            onMarkAsRead,
            onMarkAsUnread,
        },
        ref,
    ) => {
        const labels = Array.from(
            new Set(thread.emails.flatMap((email) => email.sysLabels)),
        );

        const dates = useMemo(() => {
            return {
                category: format(
                    new Date(thread.emails.at(0)?.sentAt ?? new Date()),
                    "yyyy-MM-dd",
                ),
                sentAt: formatDistanceToNow(
                    new Date(thread.emails.at(-1)?.sentAt ?? new Date()),
                    {
                        addSuffix: true,
                    },
                ),
            };
        }, [thread.emails]);

        const overLay = useMemo(
            () => (
                <div className="bg-transparent opacity-0 pointer-events-none group-data-[checked=true]:pointer-events-auto group-data-[checked=true]:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 z-10 h-full top-0 right-0 rounded-lg overflow-hidden transition-all w-full absolute flex items-center">
                    <div
                        className="flex-1 flex flex-col justify-start h-full"
                        suppressHydrationWarning
                    >
                        <Checkbox
                            className="mr-auto ml-2 mt-8"
                            checked={isSelected}
                            onCheckedChange={() => {
                                setIsSelected?.(thread.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center h-1/2">
                        <Button
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead?.(thread.id);
                            }}
                            title="Mark as read"
                            className="group-data-[checked=true]:opacity-0"
                        >
                            <MailOpen className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsUnread?.(thread.id);
                            }}
                            title="Mark as unread"
                            className="group-data-[checked=true]:opacity-0"
                        >
                            <Mail className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(thread.id);
                            }}
                            title="Delete"
                            className="group-data-[checked=true]:opacity-0  hover:text-destructive transition-all"
                        >
                            <Trash2Icon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ),
            [isSelected, onDelete, setIsSelected, thread.id],
        );
        return (
            <>
                {shouldShowDate && (
                    <p className="text-xs text-muted-foreground">
                        {dates.category}
                    </p>
                )}
                <motion.div
                    ref={ref}
                    role="button"
                    tabIndex={0}
                    data-checked={isSelected}
                    className={cn(
                        "flex group w-full flex-col items-start text-left text-sm space-y-3 rounded-lg border hover:bg-accent data-[checked=true]:pl-8 hover:pl-8 transition-all relative bg-card p-4",
                        isActive && "bg-muted",
                        isSelected && "bg-muted",
                    )}
                    onClick={() => setIsActive?.(thread.id)}
                    layoutId={isDeleting ? `thread-${thread.id}` : undefined}
                    layout={!!isDeleting}
                    transition={{
                        layout: {
                            duration: 0.085,
                            type: "spring",
                            bounce: 1,
                        },
                        opacity: {
                            duration: 0.15,
                        },
                    }}
                >
                    {overLay}
                    <div className="flex w-full flex-col gap-1">
                        <div className="flex items-center">
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold">
                                    {thread.emails.at(-1)?.from?.name ??
                                        "Unknown Sender"}
                                </h4>
                                {labels.includes("unread") && (
                                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                                )}
                            </div>
                            <div
                                className={cn(
                                    "ml-auto text-xs group-hover:opacity-0",
                                    isActive
                                        ? "text-foreground"
                                        : "text-muted-foreground",
                                )}
                            >
                                {dates.sentAt}
                            </div>
                        </div>
                        <p className="text-xs font-medium">
                            {thread.emails.at(-1)?.subject}
                        </p>
                    </div>
                    <p
                        className="line-clamp-3 text-xs text-muted-foreground"
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                                thread.emails.at(-1)?.bodySnippet ?? "",
                                {
                                    USE_PROFILES: { html: true },
                                },
                            ),
                        }}
                    ></p>
                    <div className="flex space-x-2">
                        {labels.map((label) => (
                            <Badge
                                key={label}
                                variant={getBadgeVariantFromLabel(label)}
                            >
                                {label}
                            </Badge>
                        ))}
                    </div>
                </motion.div>
            </>
        );
    },
);
ThreadItem.displayName = "ThreadItem";

function getBadgeVariantFromLabel(
    label: string,
): React.ComponentProps<typeof Badge>["variant"] {
    if (["unread"].includes(label.toLowerCase())) {
        return "default";
    }

    if (["inbox"].includes(label.toLowerCase())) {
        return "outline";
    }

    return "secondary";
}

export function ThreadItemLoading() {
    return (
        <div className="flex flex-col space-y-3 rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex space-x-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
        </div>
    );
}
