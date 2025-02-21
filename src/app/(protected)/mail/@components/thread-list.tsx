"use client";

import { InfiniteScrollContainer } from "@/components/ui/infinite-scroll";
import { useGetThreads } from "@/hooks/api/use-get-threads";
import {
    ThreadItem,
    ThreadItemLoading,
} from "@/app/(protected)/mail/@components/thread-item";
import { useQueryState } from "nuqs";
import { ThreadListToolbar } from "@/app/(protected)/mail/@components/thread-list-toolbar";
import { useThreadNavigation } from "@/hooks/use-thread-navigation";

interface ThreadListProps {
    done: boolean;
}

export function ThreadList({ done }: ThreadListProps) {
    const {
        data,
        isFetching,
        hasNextPage,
        fetchNextPage,
        isPending,
        isFetchingNextPage,
        error,
    } = useGetThreads({ done });
    const threads = data?.pages.flatMap((page) => page.data);
    const [activeThread, setActiveThread] = useQueryState("activeThread");
    const {
        selectedThreads,
        handleSelection,
        handleDeselectAll,
        handleSelectAll,
        itemRefs,
    } = useThreadNavigation(threads, () => {
        // TODO deletion logic
    });

    return (
        <InfiniteScrollContainer
            isLoading={isFetching}
            hasMore={hasNextPage}
            next={fetchNextPage}
            className="p-4 space-y-4"
        >
            {isPending &&
                [...Array<unknown>(12)].map((_, i) => (
                    <ThreadItemLoading key={i} />
                ))}
            {threads && threads.length < 1 && !hasNextPage && (
                <p className="text-center h-screen text-muted-foreground">
                    Your inbox is empty 📭
                </p>
            )}
            {error && !threads && (
                <p className="text-center text-destructive">
                    Failed to load threads 😢
                </p>
            )}
            {threads &&
                threads.length > 0 &&
                threads.map((thread, i) => (
                    <ThreadItem
                        key={thread.id}
                        thread={thread}
                        ref={(el) => {
                            if (el) itemRefs.current.set(thread.id, el);
                        }}
                        shouldShowDate={(() => {
                            if (i === 0) return true;
                            if (!thread.emails[0]) return false;
                            if (!threads[i - 1]?.emails[0]) return false;
                            return (
                                new Date(thread.emails[0].sentAt).getDate() !==
                                new Date(
                                    threads[i - 1]!.emails[0]!.sentAt,
                                ).getDate()
                            );
                        })()}
                        isSelected={selectedThreads.includes(thread.id)}
                        setIsSelected={handleSelection}
                        isActive={activeThread === thread.id}
                        setIsActive={setActiveThread}
                    />
                ))}
            <ThreadListToolbar
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                selectedThreads={selectedThreads}
            />
            {isFetchingNextPage &&
                [...Array<unknown>(3)].map((_, i) => (
                    <ThreadItemLoading key={i} />
                ))}
        </InfiniteScrollContainer>
    );
}
