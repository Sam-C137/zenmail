"use client";

import { api } from "@/trpc/react";
import { useLocalStorage } from "@/hooks/use-localstorage";
import { SELECTED_ACCOUNT_ID } from "@/app/(protected)/mail/@components/account-switcher";
import { useIsomorphicLayoutEffect } from "@/hooks/use-Isomorphic-layout-effect";

export function useAccount() {
    const [accounts] = api.account.me.list.useSuspenseQuery(undefined, {
        staleTime: Infinity,
    });
    const [selectedAccountId, setSelectedAccountId] = useLocalStorage(
        SELECTED_ACCOUNT_ID,
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
