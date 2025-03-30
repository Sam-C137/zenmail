"use client";

import { api } from "@/trpc/react";
import { useLocalStorage } from "@/hooks/use-localstorage";
import { useIsomorphicLayoutEffect } from "@/hooks/use-Isomorphic-layout-effect";
import { keys } from "@/lib/constants";

export function useAccount() {
    const [accounts] = api.account.me.list.useSuspenseQuery(undefined, {
        staleTime: Infinity,
    });
    const [selectedAccountId, setSelectedAccountId] = useLocalStorage(
        keys.LocalStorage.SelectedAccountId,
        "",
    );
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
