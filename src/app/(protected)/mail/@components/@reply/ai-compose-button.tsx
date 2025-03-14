import {
    DialogStackHeader,
    DialogStackContent,
    DialogStackPrevious,
    DialogStackFooter,
    DialogStackNext,
    DialogStack,
    DialogStackTrigger,
    DialogStackOverlay,
    DialogStackBody,
} from "@/components/ui/dialog-stack";
import {
    ChatInput,
    ChatInputSubmit,
    ChatInputTextArea,
} from "@/components/ui/chat-input";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BotIcon, CornerDownLeft, RotateCcw, Sparkles } from "lucide-react";
import { generateEmail } from "@/app/(protected)/mail/@components/@reply/actions";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AiComposeButtonProps {
    /**
     * Whether the user is currently composing or replying, if we are replying, we need the whole email as context.
     */
    isComposing: boolean;
    onGenerate?: (token: string) => void;
    context?: string;
}

export function AiComposeButton({
    isComposing,
    onGenerate,
    context,
}: AiComposeButtonProps) {
    const [value, setValue] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const { toast } = useToast();
    const closeRef = useRef<HTMLDivElement>(null);

    const generate = async () => {
        const { output, error } = await generateEmail({
            context: context ?? "",
            prompt: value,
        });
        if (error || !output) {
            toast({
                variant: "destructive",
                description: error,
            });
            return;
        }

        const reader = output.getReader();
        const decoder = new TextDecoder();
        setSuggestions((prev) => [...prev, ""]);
        if (activeIdx < suggestions.length) {
            setActiveIdx(suggestions.length);
        }
        setActiveIdx((prev) => prev + 1);
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            const line = decoder.decode(value);
            if (line.startsWith("0")) {
                const clean = line
                    .substring(3, line.length - 2)
                    .replace(/\\n/g, "\n");
                setSuggestions((prev) => {
                    const last = prev.length - 1;
                    return prev.map((s, idx) => (idx === last ? s + clean : s));
                });
            }
        }
    };

    const generation = useMutation({
        mutationFn: generate,
    });

    return (
        <DialogStack controls={{ activeIdx, setActiveIdx }}>
            <DialogStackTrigger asChild>
                <Button variant="outline" size="icon" className="size-6">
                    <BotIcon className="size-4" />
                </Button>
            </DialogStackTrigger>
            <DialogStackOverlay ref={closeRef} />
            <DialogStackBody key={suggestions.length}>
                <DialogStackContent
                    className={cn(
                        "rounded-2xl",
                        suggestions.length > 0 && "h-[300px]",
                    )}
                >
                    <DialogStackHeader className="text-center font-semibold text-2xl">
                        Supercharge your email
                    </DialogStackHeader>
                    <p className="text-sm text-muted-foreground">
                        {isComposing
                            ? "Let AI craft the perfect message for you in seconds. Just type a few words, and we’ll handle the rest!"
                            : "AI-powered replies based on the conversation. Keep it fast, smart, and seamless."}
                    </p>
                    <ChatInput
                        variant="default"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onSubmit={generation.mutate}
                        loading={generation.isPending}
                    >
                        <ChatInputTextArea
                            placeholder="Give a subtle description..."
                            className="px-1 h-full"
                            style={{
                                height: suggestions.length > 1 ? 80 : "auto",
                            }}
                            autoResize={false}
                        />
                        <ChatInputSubmit />
                    </ChatInput>
                    <DialogStackFooter
                        className={cn(
                            "pt-1 !mt-auto",
                            suggestions.length < 1 && "sr-only",
                        )}
                    >
                        <DialogStackNext>
                            <Sparkles className="size-4" />
                            View AI suggestions
                        </DialogStackNext>
                    </DialogStackFooter>
                </DialogStackContent>
                {suggestions.map((suggestion, idx) => (
                    <DialogStackContent
                        className="h-[300px] rounded-2xl"
                        key={idx}
                    >
                        <div className="flex space-y-1.5 flex-col">
                            <DialogStackHeader className="font-semibold text-xl">
                                Review suggestion
                            </DialogStackHeader>
                            <div className="flex items-center gap-1 justify-end">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="size-6"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => generation.mutate()}
                                        >
                                            <RotateCcw className="size-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Regenerate</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="size-6"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                onGenerate?.(suggestion);
                                                closeRef?.current?.click();
                                            }}
                                        >
                                            <CornerDownLeft className="size-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Accept</TooltipContent>
                                </Tooltip>
                            </div>
                            <ScrollArea className="h-full  bg-zinc-200 dark:bg-zinc-900 py-2 px-2 rounded-xl flex-1 border">
                                <ScrollBar orientation="vertical" />
                                <div className="h-[130px] min-h-full transition-all">
                                    {suggestion}
                                </div>
                            </ScrollArea>
                            <DialogStackFooter className="pt-1">
                                <DialogStackPrevious>
                                    Previous
                                </DialogStackPrevious>
                                <DialogStackNext>Next</DialogStackNext>
                            </DialogStackFooter>
                        </div>
                    </DialogStackContent>
                ))}
            </DialogStackBody>
        </DialogStack>
    );
}
