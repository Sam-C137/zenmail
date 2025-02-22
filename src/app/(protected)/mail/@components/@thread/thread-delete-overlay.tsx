import { AnimatePresence, motion, type Variants } from "framer-motion";
import { TrashBack, TrashFront } from "./trash-assets";
import { useCallback, useRef, useState } from "react";
import type { RouterOutputs } from "@/trpc/react";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import { useEventListener } from "@/hooks/use-event-listener";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface ThreadDeleteOverlayProps {
    selectedThreads: string[];
    threads: RouterOutputs["thread"]["getThreads"]["data"] | undefined;
    isOpen: boolean;
    onClose: () => void;
}

export function ThreadDeleteOverlay({
    isOpen,
    threads,
    selectedThreads,
    onClose,
}: ThreadDeleteOverlayProps) {
    const [removed, setRemoved] = useState(false);
    const ref = useRef(null);
    useOnClickOutside(ref, onClose);
    const threadsToRemove =
        threads?.filter((thread) => selectedThreads.includes(thread.id)) ?? [];

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            if (isOpen) event.stopImmediatePropagation();
            onClose();
        }
    };
    useEventListener("keydown", handleKeyDown);

    const getCardPosition = useCallback((index: number, total: number) => {
        const spreadX = ((index - (total - 1) / 2) * 50) / total;
        const spreadY = index * -2;
        return { x: spreadX, y: spreadY };
    }, []);

    const getCardRotation = useCallback((index: number) => {
        const baseRotation = 90;
        const randomFactor = (index % 2 === 0 ? 1 : -1) * (Math.random() * 15);
        return baseRotation + randomFactor;
    }, []);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={overlayVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="fixed inset-0 !mt-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                    >
                        <div
                            ref={ref}
                            className="relative flex flex-col items-center"
                        >
                            <div className="relative z-10 h-[200px] w-[160px]">
                                <motion.div
                                    variants={trashBackVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <TrashBack />
                                </motion.div>

                                <motion.div
                                    variants={getTrashContainerVariants(
                                        removed,
                                    )}
                                    initial="initial"
                                    animate="animate"
                                    transition={
                                        removed
                                            ? {
                                                  duration: 0.3,
                                                  type: "spring",
                                                  bounce: 0,
                                              }
                                            : { delay: 0.13 }
                                    }
                                    className="absolute flex w-full top-[-20px] items-center justify-center"
                                >
                                    {threadsToRemove.map((thread, index) => {
                                        const position = getCardPosition(
                                            index,
                                            threadsToRemove.length,
                                        );
                                        const rotation = getCardRotation(index);

                                        return (
                                            <motion.div
                                                key={thread.id}
                                                layoutId={`thread-${thread.id}`}
                                                variants={getThreadCardVariants(
                                                    position,
                                                    rotation,
                                                )}
                                                initial="initial"
                                                animate="animate"
                                                transition={{
                                                    duration: 0.4,
                                                    type: "spring",
                                                    bounce: 0.2,
                                                }}
                                                className="absolute flex w-[140px] flex-col space-y-2 rounded-lg border bg-card p-2"
                                                style={{
                                                    transformOrigin:
                                                        "center center",
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold h-3 text-xs line-clamp-1">
                                                        {thread.emails.at(-1)
                                                            ?.from?.name ??
                                                            "Unknown Sender"}
                                                    </h4>
                                                </div>
                                                <p className="text-xs line-clamp-2 font-medium h-3">
                                                    {
                                                        thread.emails.at(-1)
                                                            ?.subject
                                                    }
                                                </p>
                                                <div className="flex space-x-1">
                                                    <Badge className="h-4 text-xs">
                                                        ...
                                                    </Badge>
                                                    <Badge
                                                        className="h-4 text-xs px-1"
                                                        variant="outline"
                                                    >
                                                        ...
                                                    </Badge>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>

                                <motion.div
                                    variants={trashFrontVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ delay: 0.175, duration: 0 }}
                                    className="absolute bottom-[0] left-[3px] h-full w-[150px]"
                                >
                                    <TrashFront />
                                </motion.div>
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                                <Checkbox />
                                Don&#39;t show this confirmation again
                            </div>
                            <motion.div
                                variants={deleteButtonVariants}
                                initial="initial"
                                animate="animate"
                                transition={{
                                    duration: 0.3,
                                    bounce: 0,
                                    type: "spring",
                                }}
                                className="mt-4 flex flex-col gap-2"
                            >
                                <button
                                    onClick={() => {
                                        setRemoved(true);
                                    }}
                                    className="flex h-8 w-[200px] items-center justify-center gap-[15px] rounded-full bg-[#FF3F40] text-center text-[13px] font-semibold text-[#FFFFFF]"
                                >
                                    Move to Trash
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

const overlayVariants: Variants = {
    initial: {
        filter: "blur(4px)",
        opacity: 0,
    },
    animate: {
        filter: "blur(0px)",
        opacity: 1,
    },
    exit: {
        filter: "blur(4px)",
        opacity: 0,
    },
};

const trashBackVariants: Variants = {
    initial: {
        scale: 1.2,
        filter: "blur(4px)",
        opacity: 0,
    },
    animate: {
        scale: 1,
        filter: "blur(0px)",
        opacity: 1,
    },
    exit: {
        scale: 1.2,
        filter: "blur(4px)",
        opacity: 0,
    },
};

const trashFrontVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

const deleteButtonVariants: Variants = {
    initial: {
        scale: 1.2,
        opacity: 0,
        filter: "blur(4px)",
    },
    animate: {
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
    },
};

const getTrashContainerVariants = (removed: boolean): Variants => ({
    initial: { y: 73, scale: 1, filter: "blur(0px)" },
    animate: {
        y: removed ? 110 : 73,
        scale: removed ? 0.7 : 1,
        filter: removed ? "blur(4px)" : "blur(0px)",
    },
});

const getThreadCardVariants = (
    position: { x: number; y: number },
    rotation: number,
): Variants => ({
    initial: {
        opacity: 0,
        scale: 0.8,
        x: 0,
        y: -50,
        rotate: 0,
    },
    animate: {
        opacity: 1,
        scale: 1,
        x: position.x,
        y: position.y,
        rotate: rotation,
    },
});
