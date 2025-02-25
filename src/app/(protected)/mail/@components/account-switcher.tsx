"use client";

import { cn } from "@/lib/utils";
import { getAurinkoAuthUrl } from "@/server/aurinko.actions";
import { ChevronsUpDown } from "lucide-react";
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
import { useMeasure } from "@/hooks/use-measure";
import { GoogleIcon } from "@/components/ui/google-icon";
import { MicrosoftIcon } from "@/components/ui/microsoft-icon";
import { adventurerNeutral } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAccount } from "@/hooks/api/use-account";

interface AccountSwitcherProps {
    isCollapsed: boolean;
}

export const SELECTED_ACCOUNT_ID = "selectedAccountId";

export function AccountSwitcher({ isCollapsed }: AccountSwitcherProps) {
    const [ref, bounds] = useMeasure();
    const { selectedAccount, accounts, setSelectedAccountId } = useAccount();

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
                    {isCollapsed ? (
                        <span className=" w-full h-full flex items-center justify-center">
                            <Avatar className="size-7 rounded-lg">
                                <AvatarImage
                                    src={createAvatar(adventurerNeutral, {
                                        size: 24,
                                        seed: selectedAccount?.emailAddress,
                                    }).toDataUri()}
                                />
                                <AvatarFallback>
                                    {selectedAccount?.emailAddress?.at(0)}
                                </AvatarFallback>
                            </Avatar>
                        </span>
                    ) : (
                        <>
                            <span className="flex items-center gap-2 truncate">
                                <Avatar className="size-7 rounded-lg">
                                    <AvatarImage
                                        src={createAvatar(adventurerNeutral, {
                                            size: 24,
                                            seed: selectedAccount?.emailAddress,
                                        }).toDataUri()}
                                    />
                                    <AvatarFallback>
                                        {selectedAccount?.emailAddress?.at(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="ml-2">
                                    {selectedAccount?.emailAddress}
                                </span>
                            </span>
                            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-full"
                style={{ ...(!isCollapsed && { width: bounds?.width }) }}
            >
                {accounts.map((account) => (
                    <DropdownMenuItem
                        key={account.id}
                        onSelect={() => setSelectedAccountId(account.id)}
                        className="w-full"
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className="size-7 rounded-lg">
                                <AvatarImage
                                    src={createAvatar(adventurerNeutral, {
                                        size: 24,
                                        seed: account.emailAddress,
                                    }).toDataUri()}
                                />
                                <AvatarFallback>
                                    {account.emailAddress?.at(0)}
                                </AvatarFallback>
                            </Avatar>
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
                                className="w-full py-1 flex gap-8"
                            >
                                Google
                                <GoogleIcon className="ml-auto h-4 w-4 shrink-0" />
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={async () => {
                                    window.location.href =
                                        await getAurinkoAuthUrl("Office365");
                                }}
                                className="w-full py-1 flex gap-8"
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
