"use client";

import { useQueryState } from "nuqs";
import { useLocalStorage } from "@/hooks/use-localstorage";
import { SELECTED_ACCOUNT_ID } from "@/app/(protected)/mail/@components/account-switcher";
import { api } from "@/trpc/react";
import { type EmailLabel } from "@prisma/client";
import { type } from "arktype";

interface UseThreadsOptions {
    done: boolean;
    take?: number;
}

export function useGetThreads({ take, done }: UseThreadsOptions) {
    const [accountId] = useLocalStorage(SELECTED_ACCOUNT_ID, "");
    const [tab] = useQueryState<EmailLabel>("tab", {
        defaultValue: "inbox",
        parse: (value) => {
            const parsed = type("'trash' | 'sent' | 'inbox' | 'draft'")(value);
            if (parsed instanceof type.errors) {
                return "inbox";
            }
            return parsed;
        },
    });

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
