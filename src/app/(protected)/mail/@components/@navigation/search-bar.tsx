"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useQueryState } from "nuqs";
import { keys } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function SearchBar() {
    const [search, setSearch] = useQueryState(keys.QueryParams.Search);
    return (
        <div className="relative m-4">
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
    );
}
