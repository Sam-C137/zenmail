"use client";

import { api } from "@/trpc/react";
import { useLocalStorage } from "@/hooks/use-localstorage";
import { useIsomorphicLayoutEffect } from "@/hooks/use-Isomorphic-layout-effect";
import { keys, time } from "@/lib/constants";

export function useAccount() {
    const [selectedAccountId, setSelectedAccountId] = useLocalStorage(
        keys.LocalStorage.SelectedAccountId,
        "",
    );
    const [accounts] = api.account.me.list.useSuspenseQuery(undefined, {
        staleTime: Infinity,
        refetchInterval(query) {
            const prev = query.state.data?.find(
                (account) => account.id === selectedAccountId,
            );
            if (prev?.initialSyncStatus === "Partial") {
                return time.Second * 20;
            }
            return undefined;
        },
    });
    const selectedAccount = accounts.find(
        (account) => account.id === selectedAccountId,
    );

    useIsomorphicLayoutEffect(() => {
        if (accounts.length > 0 && (!selectedAccountId || !selectedAccount)) {
            setSelectedAccountId(accounts?.at(0)?.id ?? "");
        }
    }, [accounts]);

    return {
        accounts,
        selectedAccount,
        selectedAccountId,
        setSelectedAccountId,
    };
}
