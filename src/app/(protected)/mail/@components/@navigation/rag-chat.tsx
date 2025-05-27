import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SendIcon, SparklesIcon } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { useAccount } from "@/hooks/api/use-account";
import { type ChangeEvent, useRef, useEffect, useCallback } from "react";
import { MessageLoading } from "@/components/ui/message-loading";
import { ChatInputTextArea } from "@/components/ui/chat-input";

export function RagChat() {
    const { selectedAccountId } = useAccount();
    const formRef = useRef<HTMLFormElement>(null);
    const messageContainerRef = useRef<HTMLDivElement>(null);

    const { input, handleInputChange, status, handleSubmit, messages } =
        useChat({
            api: "/api/chat",
            body: {
                accountId: selectedAccountId,
            },
            onError(e) {
                console.warn(e);
            },
            initialMessages: [],
        });

    const exampleMessages = [
        "What can I ask?",
        "When is my next meeting?",
        "What is my next flight?",
        "Find my last email from John",
    ];

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && status !== "streaming" && status !== "submitted") {
            handleSubmit(e);
        }
    };

    const scrollToBottom = useCallback(() => {
        if (messageContainerRef.current) {
            const container = messageContainerRef.current;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth",
            });
        }
    }, []);

    useEffect(() => {
        const frame = requestAnimationFrame(scrollToBottom);
        return () => cancelAnimationFrame(frame);
    }, [messages.length, status, messages, scrollToBottom]);

    const handleExampleClick = (message: string) => {
        handleInputChange({
            target: { value: message },
        } as ChangeEvent<HTMLInputElement>);
    };

    return (
        <div className="pb-4 mx-2 mb-6">
            <div className="flex flex-1 flex-col items-end p-4 rounded-lg shadow-inner bg-muted/70">
                <div
                    ref={messageContainerRef}
                    className="max-h-[50vh] hide-scrollbar w-full overflow-y-auto flex flex-col gap-2 px-1"
                    id="message-container"
                >
                    <AnimatePresence initial={false} mode="popLayout">
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                layout
                                initial={
                                    message.role === "user"
                                        ? {
                                              opacity: 0,
                                              scale: 0.9,
                                              y: 5,
                                              x: 20,
                                          }
                                        : {
                                              opacity: 0,
                                              scale: 0.9,
                                              y: 5,
                                              x: -20,
                                          }
                                }
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0 }}
                                className={cn(
                                    "z-10 mt-2 max-w-[250px] break-words shadow-sm rounded-2xl",
                                    {
                                        "self-end text-muted-foreground bg-muted":
                                            message.role === "user",
                                        "self-start bg-blue-500 dark:bg-blue-600 text-white":
                                            message.role === "assistant",
                                    },
                                )}
                                transition={{
                                    type: "spring",
                                    damping: 25,
                                    stiffness: 300,
                                    duration: 0.25,
                                }}
                            >
                                <div className="px-3 py-2 text-sm leading-[15px]">
                                    {message.content}
                                </div>
                            </motion.div>
                        ))}
                        {(status === "streaming" || status === "submitted") && (
                            <motion.div
                                key="loading"
                                initial={{
                                    opacity: 0,
                                    scale: 0.9,
                                    y: 5,
                                    x: -20,
                                }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="z-10 self-start mt-2 max-w-[250px] rounded-2xl bg-blue-500 dark:bg-blue-600 text-white"
                            >
                                <div className="px-3 py-0 w-fit">
                                    <MessageLoading />
                                </div>
                            </motion.div>
                        )}
                        {status === "error" && (
                            <motion.div
                                key="error"
                                initial={{
                                    opacity: 0,
                                    scale: 0.9,
                                    y: 5,
                                    x: -20,
                                }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="z-10 self-start mt-2 bg-blue-500 text-white max-w-[250px] rounded-2xl"
                            >
                                <div className="px-3 py-2 w-fit">
                                    I am unable to process your request at the
                                    moment.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {messages.length > 0 && <div className="h-4" />}
                <div className="w-full">
                    {messages.length < 1 && (
                        <div className="mb-4">
                            <div className="flex items-center gap-4">
                                <SparklesIcon className="size-6 text-primary" />
                                <div>
                                    <p className="text-foreground font-semibold">
                                        Ask about your emails
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Get tailored responses to questions
                                        about your email
                                    </p>
                                </div>
                            </div>
                            <div className="h-2" />
                            <div className="flex items-center gap-2 flex-wrap">
                                {exampleMessages.map((message) => (
                                    <button
                                        key={message}
                                        onClick={() =>
                                            handleExampleClick(message)
                                        }
                                        className="px-2 py-1 cursor-pointer bg-foreground text-background rounded-md text-xs"
                                        type="button"
                                    >
                                        {message}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <form
                        className="w-full gap-2 items-center flex relative"
                        onSubmit={handleFormSubmit}
                        ref={formRef}
                    >
                        <div className="relative flex-grow">
                            <ChatInputTextArea
                                className="py-1 hide-scrollbar max-h-[4rem] shadow-none relative h-9 placeholder:text-sm flex-grow w-full rounded-full border border-border bg-background px-3 text-sm outline-none"
                                placeholder="When is my next flight?"
                                onChange={handleInputChange}
                                value={input}
                                onSubmit={() =>
                                    formRef.current?.requestSubmit()
                                }
                                disabled={
                                    status === "streaming" ||
                                    status === "submitted"
                                }
                            />
                        </div>

                        <Button
                            type="submit"
                            className="rounded-sm w-fit h-fit p-1"
                            size="icon"
                            variant="ghost"
                            disabled={
                                status === "streaming" ||
                                status === "submitted" ||
                                !input.trim()
                            }
                        >
                            <SendIcon className="size-4 text-muted-foreground" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
