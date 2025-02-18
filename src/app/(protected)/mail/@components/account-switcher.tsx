"use client";

import { api } from "@/trpc/react";
import { useLocalStorage } from "@/hooks/use-localstorage";
import { cn } from "@/lib/utils";
import { getAurinkoAuthUrl } from "@/server/aurinko.actions";
import { ChevronRight, ChevronsUpDown, Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { useMeasure } from "@/hooks/use-measure";
import { GoogleIcon } from "@/components/ui/google-icon";
import { MicrosoftIcon } from "@/components/ui/microsoft-icon";

interface AccountSwitcherProps {
    isCollapsed: boolean;
}

export function AccountSwitcher({ isCollapsed }: AccountSwitcherProps) {
    const [accounts] = api.account.getAccounts.useSuspenseQuery();
    const [ref, bounds] = useMeasure();
    const [selectedAccountId, setSelectedAccountId] = useLocalStorage(
        "selectedAccountId",
        "",
    );
    const selectedAccount = accounts.find(
        (account) => account.id === selectedAccountId,
    );
    const setInitialAccount = useCallback(() => {
        if (accounts.length > 0 && (!selectedAccountId || !selectedAccount)) {
            // hack to make sure this runs after the component is mounted
            requestAnimationFrame(() => {
                setSelectedAccountId(accounts?.at(0)?.id ?? "");
            });
        }
    }, [accounts, selectedAccountId, selectedAccount, setSelectedAccountId]);
    setInitialAccount();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "flex w-full justify-between",
                        isCollapsed && "h-9 w-9 p-0",
                    )}
                    ref={ref}
                >
                    <span
                        className={cn(
                            "flex items-center gap-2 truncate",
                            isCollapsed && "hidden",
                        )}
                    >
                        <span>{selectedAccount?.emailAddress?.at(0)}</span>
                        <span className="ml-2">
                            {selectedAccount?.emailAddress}
                        </span>
                    </span>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-full"
                style={{ width: bounds?.width }}
            >
                {accounts.map((account) => (
                    <DropdownMenuItem
                        key={account.id}
                        onSelect={() => setSelectedAccountId(account.id)}
                        className="w-full"
                    >
                        <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
                            {account.emailAddress}
                        </div>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Add account</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem
                                onClick={async () => {
                                    window.location.href =
                                        await getAurinkoAuthUrl("Google");
                                }}
                                className="w-full flex gap-8"
                            >
                                Google
                                <GoogleIcon className="ml-auto h-4 w-4 shrink-0" />
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-0" />
                            <DropdownMenuItem
                                onClick={async () => {
                                    window.location.href =
                                        await getAurinkoAuthUrl("Office365");
                                }}
                                className="w-full flex gap-8"
                            >
                                Microsoft
                                <MicrosoftIcon className="ml-auto h-4 w-4 shrink-0" />
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
