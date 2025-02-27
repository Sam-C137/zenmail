"use client";

import { useQueryState } from "nuqs";
import { useLocalStorage } from "@/hooks/use-localstorage";
import { SELECTED_ACCOUNT_ID } from "@/app/(protected)/mail/@components/account-switcher";
import { api } from "@/trpc/react";
import { tabState } from "@/lib/state";

interface UseThreadsOptions {
    done: boolean;
    take?: number;
}

export function useGetThreads({ take, done }: UseThreadsOptions) {
    const [accountId] = useLocalStorage(SELECTED_ACCOUNT_ID, "");
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
