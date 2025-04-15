import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SendIcon, SparklesIcon } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { useAccount } from "@/hooks/api/use-account";
import { type ChangeEvent, useRef } from "react";
import { MessageLoading } from "@/components/ui/message-loading";
import { ChatInputTextArea } from "@/components/ui/chat-input";

export function RagChat() {
    const { selectedAccountId } = useAccount();
    const formRef = useRef<HTMLFormElement>(null);
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
    return (
        <div className="pb-4 mx-2 mb-6">
            <motion.div className="flex flex-1 flex-col items-end p-4 rounded-lg shadow-inner bg-muted/70">
                <div
                    className="max-h-[50vh] w-full hide-scrollbar overflow-y-scroll flex flex-col gap-2"
                    id="message-container"
                >
                    <AnimatePresence mode="wait">
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                layout="position"
                                className={cn(
                                    "z-10 mt-2 max-w-[250px] break-words rounded-2xl bg-muted",
                                    {
                                        "self-end text-muted-foreground":
                                            message.role === "user",
                                        "self-start bg-blue-500 text-muted":
                                            message.role === "assistant",
                                    },
                                )}
                                layoutId={`bubble-${messages.length - 1}`}
                                transition={{
                                    type: "easeOut",
                                    duration: 0.2,
                                }}
                            >
                                <div className="px-3 py-2 text-sm leading-[15px]">
                                    {message.content}
                                </div>
                            </motion.div>
                        ))}
                        {status === "streaming" ||
                            (status === "submitted" && (
                                <div className="z-10 text-xs mt-2 max-w-[250px] rounded-2xl bg-muted">
                                    <div className="px-3 py-2 w-fit">
                                        <MessageLoading />
                                    </div>
                                </div>
                            ))}
                        {status === "error" && (
                            <div className="z-10 text-xs mt-2 bg-blue-500 text-muted max-w-[250px] rounded-2xl">
                                <div className="px-3 py-2 w-fit">
                                    I am unable to process your request at the
                                    moment.
                                </div>
                            </div>
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
                                    <span
                                        key={message}
                                        onClick={() => {
                                            handleInputChange({
                                                target: {
                                                    value: message,
                                                },
                                            } as ChangeEvent<HTMLInputElement>);
                                        }}
                                        className="px-2 py-1 cursor:pointer bg-foreground text-background rounded-md text-xs"
                                    >
                                        {message}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    <form
                        className="w-full gap-2 items-center flex"
                        onSubmit={handleSubmit}
                        ref={formRef}
                    >
                        <ChatInputTextArea
                            className="py-1 hide-scrollbar max-h-[4rem] shadow-none relative h-9 placeholder:text-sm flex-grow rounded-full border border-border bg-background px-3 text-sm outline-none"
                            placeholder="When is my next flight?"
                            onChange={handleInputChange}
                            value={input}
                            onSubmit={() => formRef.current?.requestSubmit()}
                        />
                        <motion.div
                            key={messages.length}
                            layout="position"
                            className="pointer-events-none absolute z-10 flex h-9 w-[250px] items-center overflow-hidden break-words rounded-full bg-muted [word-bread:break-word]"
                            layoutId={`bubble-${messages.length}`}
                            transition={{
                                type: "easeOut",
                                duration: 0.2,
                            }}
                            initial={{
                                opacity: 0.6,
                                zIndex: -1,
                            }}
                            animate={{
                                opacity: 0.6,
                                zIndex: -1,
                            }}
                            exit={{
                                opacity: 1,
                                zIndex: 1,
                            }}
                        >
                            <div className="px-3 py-2 text-sm leading-[15px] text-muted-foreground">
                                {input}
                            </div>
                        </motion.div>
                        <Button
                            type="submit"
                            className="rounded-sm w-fit h-fit p-1"
                            size="icon"
                            variant="ghost"
                        >
                            <SendIcon className="size-4 text-muted-foreground" />
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
