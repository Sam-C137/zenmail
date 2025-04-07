"use client";

import type { LucideIcon } from "lucide-react";
import type { EmailLabel } from "@prisma/client";
import { useLocalStorage } from "@/hooks/use-localstorage";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryState } from "nuqs";
import { tabState } from "@/lib/state";
import { keys } from "@/lib/constants";

interface Link$ {
    title: string;
    icon: LucideIcon;
    active: boolean;
    value: EmailLabel | "starred";
}

interface NavItemProps {
    isCollapsed: boolean;
    links: Link$[];
}

export function NavItem({ links, isCollapsed }: NavItemProps) {
    const [selectedAccountId] = useLocalStorage(
        keys.LocalStorage.SelectedAccountId,
        "",
    );
    const [, setTab] = useQueryState(...tabState);

    return (
        <div
            data-collapsed={isCollapsed}
            className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
        >
            <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                {links.map((link, index) =>
                    isCollapsed ? (
                        <Tooltip key={index} delayDuration={0}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={async () =>
                                        await setTab(link.value)
                                    }
                                    className={cn(
                                        buttonVariants({
                                            variant: link.active
                                                ? "default"
                                                : "ghost",
                                            size: "icon",
                                        }),
                                        "h-9 w-9 cursor-pointer",
                                        link.active &&
                                            "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
                                    )}
                                >
                                    <link.icon className="w-4 h-4" />
                                    <span className="sr-only">
                                        {link.title}
                                    </span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="right"
                                className="flex items-center gap-4"
                            >
                                {link.title}
                                <ThreadCount
                                    accountId={selectedAccountId}
                                    type={link.value}
                                    isActive={link.active}
                                    className="text-muted-foreground"
                                />
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <span
                            key={index}
                            onClick={async () => await setTab(link.value)}
                            className={cn(
                                buttonVariants({
                                    variant: link.active ? "default" : "ghost",
                                    size: "sm",
                                }),
                                link.active &&
                                    "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                                "justify-start cursor-pointer",
                            )}
                        >
                            <link.icon className="w-4 h-4 mr-2" />
                            {link.title}
                            <ThreadCount
                                accountId={selectedAccountId}
                                type={link.value}
                                isActive={link.active}
                            />
                        </span>
                    ),
                )}
            </nav>
        </div>
    );
}

interface ThreadCountProps {
    accountId: string;
    type: EmailLabel | "starred";
    className?: string;
    isActive: boolean;
}

function ThreadCount({
    type,
    accountId,
    isActive,
    className,
}: ThreadCountProps) {
    const { data, isPending } = api.thread.count.useQuery(
        {
            accountId,
            type,
        },
        {
            staleTime: Infinity,
            enabled: !!accountId,
        },
    );

    if (isPending) {
        return <Skeleton className={cn("ml-auto h-4 w-4", className)} />;
    }

    return (
        <span
            className={cn(
                "ml-auto",
                isActive && "text-background dark:text-white",
                className,
            )}
        >
            {data}
        </span>
    );
}
