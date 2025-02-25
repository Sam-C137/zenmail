import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
    Clock,
    Forward,
    MailOpen,
    Reply,
    ReplyAll,
    Star,
    Trash2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, addHours, format, nextSaturday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

interface ThreadDisplayHeaderProps {
    onReply?: () => void;
    onReplyAll?: () => void;
}

export function ThreadDisplayHeader({}: ThreadDisplayHeaderProps) {
    const today = new Date();

    return (
        <div className="flex items-center p-1.5">
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MailOpen className="h-4 w-4" />
                            <span className="sr-only">Mark as unread</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mark as unread</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Star className="h-4 w-4" />
                            <span className="sr-only">Star thread</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Star thread</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Move to trash</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Move to trash</TooltipContent>
                </Tooltip>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Tooltip>
                    <Popover>
                        <PopoverTrigger asChild>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Clock className="h-4 w-4" />
                                    <span className="sr-only">Snooze</span>
                                </Button>
                            </TooltipTrigger>
                        </PopoverTrigger>
                        <PopoverContent className="flex w-[535px] p-0">
                            <div className="flex flex-col gap-2 border-r px-2 py-4">
                                <div className="px-4 text-sm font-medium">
                                    Snooze until
                                </div>
                                <div className="grid min-w-[250px] gap-1">
                                    <Button
                                        variant="ghost"
                                        className="justify-start font-normal"
                                    >
                                        Later today{" "}
                                        <span className="ml-auto text-muted-foreground">
                                            {format(
                                                addHours(today, 4),
                                                "E, h:m b",
                                            )}
                                        </span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="justify-start font-normal"
                                    >
                                        Tomorrow
                                        <span className="ml-auto text-muted-foreground">
                                            {format(
                                                addDays(today, 1),
                                                "E, h:m b",
                                            )}
                                        </span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="justify-start font-normal"
                                    >
                                        This weekend
                                        <span className="ml-auto text-muted-foreground">
                                            {format(
                                                nextSaturday(today),
                                                "E, h:m b",
                                            )}
                                        </span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="justify-start font-normal"
                                    >
                                        Next week
                                        <span className="ml-auto text-muted-foreground">
                                            {format(
                                                addDays(today, 7),
                                                "E, h:m b",
                                            )}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                            <div className="p-2">
                                <Calendar />
                            </div>
                        </PopoverContent>
                    </Popover>
                    <TooltipContent>Snooze</TooltipContent>
                </Tooltip>
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Reply className="h-4 w-4" />
                            <span className="sr-only">Reply</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reply</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ReplyAll className="h-4 w-4" />
                            <span className="sr-only">Reply all</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reply all</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Forward className="h-4 w-4" />
                            <span className="sr-only">Forward</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Forward</TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
