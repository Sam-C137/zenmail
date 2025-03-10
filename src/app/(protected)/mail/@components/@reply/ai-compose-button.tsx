import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    ChatInput,
    ChatInputSubmit,
    ChatInputTextArea,
} from "@/components/ui/chat-input";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BotIcon } from "lucide-react";
import { generateEmail } from "@/app/(protected)/mail/@components/@reply/actions";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

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
    const { toast } = useToast();
    const buttonRef = useRef<HTMLButtonElement>(null);

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

        if (output && onGenerate) {
            onGenerate(output);
        }
    };

    const generation = useMutation({
        mutationFn: generate,
        onSuccess() {
            buttonRef.current?.click();
        },
    });

    return (
        <Dialog>
            <DialogTrigger ref={buttonRef} asChild>
                <Button variant="outline" size="icon" className="size-6">
                    <BotIcon className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:rounded-2xl">
                <DialogTitle className="text-center font-semibold text-2xl">
                    Supercharge your email
                </DialogTitle>
                <DialogDescription>
                    {isComposing
                        ? "Let AI craft the perfect message for you in seconds. Just type a few words, and we’ll handle the rest!"
                        : "AI-powered replies based on the conversation. Keep it fast, smart, and seamless."}
                </DialogDescription>
                <ChatInput
                    variant="default"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onSubmit={generation.mutate}
                    loading={generation.isPending}
                >
                    <ChatInputTextArea
                        placeholder="Give a subtle description..."
                        className="px-1"
                    />
                    <ChatInputSubmit />
                </ChatInput>
            </DialogContent>
        </Dialog>
    );
}
