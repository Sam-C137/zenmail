"use client";

import { useQueryState } from "nuqs";
import { useLocalStorage } from "@/hooks/use-localstorage";
import { api } from "@/trpc/react";
import { tabState } from "@/lib/state";
import { keys } from "@/lib/constants";

interface UseThreadsOptions {
    done: boolean;
    take?: number;
}

export function useGetThreads({ take, done }: UseThreadsOptions) {
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
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            enabled: !!accountId,
        },
    );
}
