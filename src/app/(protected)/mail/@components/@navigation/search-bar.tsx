"use client";

import { Input } from "@/components/ui/input";
import { RotateCcw, Search, X } from "lucide-react";
import { useQueryState } from "nuqs";
import { keys } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAccount } from "@/hooks/api/use-account";

export function SearchBar() {
    const [search, setSearch] = useQueryState(keys.QueryParams.Search);
    const sync = api.thread.sync.useMutation();
    const { selectedAccountId } = useAccount();
    return (
        <div className="flex m-4 items-center gap-2 justify-between">
            <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                <Input
                    placeholder="Search..."
                    className="pl-8"
                    value={search ?? ""}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="absolute right-1.5 top-1.5 flex items-center gap-2">
                    <Button
                        type="reset"
                        variant="ghost"
                        size="icon"
                        className="rounded-sm w-fit h-fit p-1"
                        onClick={() => setSearch("")}
                    >
                        <X className="size-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "rounded-sm w-fit h-fit p-1",
                            sync.isPending &&
                                "animate-spin hover:bg-transparent",
                        )}
                        onClick={() => {
                            sync.mutate({
                                accountId: selectedAccountId,
                            });
                        }}
                    >
                        <RotateCcw className="size-4 text-muted-foreground" />
                        <span className="sr-only">Refresh mail</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh mail</TooltipContent>
            </Tooltip>
        </div>
    );
}
