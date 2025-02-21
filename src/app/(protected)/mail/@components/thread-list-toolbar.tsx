"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, CircleSlash2, Trash2 } from "lucide-react";
import { useState } from "react";

interface ThreadListToolbarProps {
    selectedThreads: string[];
    onDelete?: (ids: string[]) => void;
    onSelectAll?: () => void;
    onDeselectAll?: () => void;
}

export function ThreadListToolbar({
    selectedThreads,
    onSelectAll,
    onDeselectAll,
}: ThreadListToolbarProps) {
    const [readyToRemove, setReadyToRemove] = useState(false);

    return (
        <AnimatePresence>
            {selectedThreads.length > 0 && !readyToRemove ? (
                <motion.div
                    initial={{
                        y: 20,
                        filter: "blur(4px)",
                        opacity: 0,
                    }}
                    animate={{
                        y: 0,
                        filter: "blur(0px)",
                        opacity: 1,
                    }}
                    exit={{
                        y: 20,
                        filter: "blur(4px)",
                        opacity: 0,
                    }}
                    className="fixed px-4 bottom-24 z-50 left-[40%] flex -translate-x-1/2 gap-2 rounded-xl bg-background p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_16px_-4px_rgba(0,0,0,0.1)] will-change-transform"
                >
                    <div className="flex items-center gap-4">
                        <div className="mr-2 text-sm text-muted-foreground tabular-nums">
                            {selectedThreads.length} thread(s) selected
                        </div>
                        <button
                            onClick={onSelectAll}
                            className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg bg-secondary/50 text-[11px] font-medium text-secondary-foreground transition-colors hover:bg-secondary"
                        >
                            <CheckIcon className="h-4 w-4" />
                            Select all
                        </button>
                        <button
                            onClick={() => setReadyToRemove(true)}
                            className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg bg-secondary/50 text-[11px] font-medium text-secondary-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                        >
                            <Trash2 className="h-4 w-4" />
                            Trash
                        </button>
                        <button
                            onClick={onDeselectAll}
                            className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg bg-secondary/50 text-[11px] font-medium text-secondary-foreground transition-colors hover:bg-secondary"
                        >
                            <CircleSlash2 className="h-4 w-4" />
                            Deselect All
                        </button>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
