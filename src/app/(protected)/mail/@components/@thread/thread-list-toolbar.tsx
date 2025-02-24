"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { CheckIcon, CircleSlash2, Mail, MailOpen, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMeasure } from "@/hooks/use-measure";

interface ThreadListToolbarProps {
    selectedThreads: string[];
    onDelete?: (ids: string[]) => void;
    onSelectAll?: () => void;
    onDeselectAll?: () => void;
    onMarkAsRead?: (ids: string[]) => void;
    onMarkAsUnread?: (ids: string[]) => void;
}

export function ThreadListToolbar({
    selectedThreads,
    onSelectAll,
    onDeselectAll,
    onDelete,
    onMarkAsRead,
    onMarkAsUnread,
}: ThreadListToolbarProps) {
    const [readyToRemove, setReadyToRemove] = useState(false);
    const [ref, bounds] = useMeasure();

    return (
        <AnimatePresence>
            {selectedThreads.length > 0 && !readyToRemove ? (
                <motion.div
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={toolbarVariants}
                    ref={ref}
                    style={{
                        left: `calc(50vw - ${bounds.width / 2}px)`,
                    }}
                    className="fixed bottom-[10%] z-50 -translate-x-1/2 rounded-xl bg-background px-3 p-2.5 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_16px_-4px_rgba(0,0,0,0.1)] will-change-transform"
                >
                    <div className="flex items-center gap-3">
                        <div className="mr-2 text-sm font-medium text-muted-foreground">
                            <span className="inline-flex mr-1 tabular-nums items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                {selectedThreads.length}
                            </span>{" "}
                            selected
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    onClick={onSelectAll}
                                    className="bg-secondary/50 text-secondary-foreground transition-colors hover:bg-secondary"
                                >
                                    <CheckIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Select all</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    onClick={onDeselectAll}
                                    className="bg-secondary/50 text-secondary-foreground transition-colors hover:bg-secondary"
                                >
                                    <CircleSlash2 />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Deselect all</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    onClick={() =>
                                        onMarkAsRead?.(selectedThreads)
                                    }
                                    className="bg-secondary/50 text-secondary-foreground transition-colors hover:bg-secondary"
                                >
                                    <MailOpen />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Mark as read</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    onClick={() =>
                                        onMarkAsUnread?.(selectedThreads)
                                    }
                                    className="bg-secondary/50 text-secondary-foreground transition-colors hover:bg-secondary"
                                >
                                    <Mail />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Mark as unread</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    onClick={() => {
                                        setReadyToRemove(true);
                                        onDelete?.(selectedThreads);
                                    }}
                                    className="text-lg text-destructive bg-secondary/50 hover:bg-destructive hover:text-destructive-foreground"
                                >
                                    <Trash2 />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}

const toolbarVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
};
