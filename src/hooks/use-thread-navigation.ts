import type { RouterOutputs } from "@/trpc/react";
import { useCallback, useRef, useState } from "react";
import { useEventListener } from "@/hooks/use-event-listener";

export function useThreadNavigation(
    threads: RouterOutputs["thread"]["getThreads"]["data"] | undefined,
    onDelete?: (ids: string[]) => void,
) {
    const [selectedThreads, setSelectedThreads] = useState<string[]>([]);
    const [direction, setDirection] = useState<"up" | "down" | null>(null);
    const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    const getLastSelectedIndex = useCallback(() => {
        return threads?.findIndex(
            (t) => t.id === selectedThreads[selectedThreads.length - 1],
        );
    }, [selectedThreads, threads]);

    const getFirstSelectedIndex = useCallback(() => {
        return threads?.findIndex((t) => t.id === selectedThreads[0]);
    }, [selectedThreads, threads]);

    const scrollToThread = useCallback((id: string) => {
        const el = itemRefs.current.get(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, []);

    const handleSelection = useCallback(
        (threadId: string) => {
            if (selectedThreads.includes(threadId)) {
                setSelectedThreads(
                    selectedThreads.filter((id) => id !== threadId),
                );
            } else {
                setSelectedThreads([...selectedThreads, threadId]);
            }
        },
        [selectedThreads],
    );

    const handleSelectAll = useCallback(() => {
        setSelectedThreads(threads?.map((t) => t.id) ?? []);
    }, [threads]);

    const handleDeselectAll = useCallback(() => {
        setSelectedThreads([]);
    }, []);

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            if (selectedThreads.length < 1) return;
            setSelectedThreads([]);
            setDirection(null);
        } else if (event.key === "Delete" && selectedThreads.length > 0) {
            onDelete?.(selectedThreads);
            setSelectedThreads([]);
            setDirection(null);
        } else if (event.shiftKey && event.key === "ArrowDown") {
            event.preventDefault();
            if (direction === "up" && selectedThreads.length > 1) {
                const newSelection = selectedThreads.slice(1);
                setSelectedThreads(newSelection);
                scrollToThread(newSelection[0]!);
            } else {
                setDirection("down");
                const lastIdx = getLastSelectedIndex();
                if (lastIdx === undefined || !threads) return;
                if (lastIdx < threads.length - 1) {
                    const newId = threads[lastIdx + 1]!.id;
                    setSelectedThreads((prev) => [...prev, newId]);
                    scrollToThread(newId);
                }
            }
        } else if (event.shiftKey && event.key === "ArrowUp") {
            event.preventDefault();
            if (direction === "down" && selectedThreads.length > 1) {
                const newSelection = selectedThreads.slice(0, -1);
                setSelectedThreads(newSelection);
                scrollToThread(newSelection[newSelection.length - 1]!);
            } else {
                setDirection("up");
                const firstIdx = getFirstSelectedIndex();
                if (firstIdx === undefined || !threads) return;
                if (firstIdx > 0) {
                    const newId = threads[firstIdx - 1]!.id;
                    setSelectedThreads((prev) => [newId, ...prev]);
                    scrollToThread(newId);
                }
            }
        } else if (event.ctrlKey && event.key === "a") {
            event.preventDefault();
            handleSelectAll();
        }
    };

    useEventListener("keydown", handleKeyDown);

    return {
        itemRefs,
        selectedThreads,
        setSelectedThreads,
        handleSelection,
        handleSelectAll,
        handleDeselectAll,
    };
}
