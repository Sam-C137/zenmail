import { useSession } from "@/app/session-provider";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/(auth)/actions";

export function UserButton() {
    const { user } = useSession();
    return (
        <Popover>
            <PopoverTrigger className="ml-2 cursor-pointer" asChild>
                <Avatar>
                    <AvatarImage src={user.imageUrl ?? undefined} />
                    <AvatarFallback>
                        {user.firstName?.at(0)}
                        {user.lastName?.at(0)}
                    </AvatarFallback>
                </Avatar>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-72 ml-2">
                <div className="flex px-1 pb-1 flex-col">
                    <div
                        className={cn(
                            buttonVariants({
                                variant: "ghost",
                            }),
                            "w-full rounded-none border-b h-full gap-4 justify-start flex hover:bg-transparent",
                        )}
                    >
                        <Avatar>
                            <AvatarImage src={user.imageUrl ?? undefined} />
                            <AvatarFallback>
                                {user.firstName?.at(0)}
                                {user.lastName?.at(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <div className="text-xs font-semibold">
                                {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs">{user.email}</div>
                        </div>
                    </div>
                    <Button
                        className="border-b rounded-none gap-4 w-full flex justify-start"
                        variant="ghost"
                    >
                        <Settings className="size-4" /> Manage Account
                    </Button>
                    <Button
                        className="w-full flex gap-4 justify-start"
                        variant="ghost"
                        onClick={logout}
                    >
                        <LogOut className="size-4" /> Sign out
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
