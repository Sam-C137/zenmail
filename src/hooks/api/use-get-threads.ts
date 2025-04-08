"use client";

import { useQueryState } from "nuqs";
import { useLocalStorage } from "@/hooks/use-localstorage";
import { api } from "@/trpc/react";
import { tabState } from "@/lib/state";
import { keys } from "@/lib/constants";

interface UseThreadsOptions {
    done: boolean;
    take?: number;
    query?: string;
}

export function useGetThreads({ take, done, query }: UseThreadsOptions) {
    const [accountId] = useLocalStorage(
        keys.LocalStorage.SelectedAccountId,
        "",
    );
    const [tab] = useQueryState(...tabState);

    return api.thread.getThreads.useInfiniteQuery(
        {
            accountId,
            type: tab,
            take,
            done,
            query,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            enabled: !!accountId,
        },
    );
}
