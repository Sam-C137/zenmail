"use client";

import { InfiniteScrollContainer } from "@/components/ui/infinite-scroll";
import { useGetThreads } from "@/hooks/api/use-get-threads";
import {
    ThreadItem,
    ThreadItemLoading,
} from "@/app/(protected)/mail/@components/thread-item";
import { useState } from "react";
import { useQueryState } from "nuqs";

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
    const [checkedThreads, setCheckedThreads] = useState<string[]>([]);
    const [activeThread, setActiveThread] = useQueryState("activeThread");

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
            {error && (
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
                        isSelected={checkedThreads.includes(thread.id)}
                        setIsSelected={(threadId) => {
                            if (checkedThreads.includes(threadId)) {
                                setCheckedThreads(
                                    checkedThreads.filter(
                                        (id) => id !== threadId,
                                    ),
                                );
                            } else {
                                setCheckedThreads([
                                    ...checkedThreads,
                                    threadId,
                                ]);
                            }
                        }}
                        isActive={activeThread === thread.id}
                        setIsActive={setActiveThread}
                    />
                ))}
            {isFetchingNextPage &&
                [...Array<unknown>(3)].map((_, i) => (
                    <ThreadItemLoading key={i} />
                ))}
        </InfiniteScrollContainer>
    );
}
