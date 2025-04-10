"use client";

import { type Editor, EditorContent } from "@tiptap/react";
import { useMemo, useState } from "react";
import { ReplyEditorMenuBar } from "./reply-editor-menu-bar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useDeviceType } from "@/hooks/use-device-type";
import { KeyboardKey } from "@/components/ui/keyboard-key";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { MultipleSelector, type Option } from "@/components/ui/multiselect";
import { Input } from "@/components/ui/input";
import { useAccount } from "@/hooks/api/use-account";
import { api } from "@/trpc/react";
import { BarsLoader } from "@/app/(auth)/@components/submit-button";
import { ImagePlus, Paperclip } from "lucide-react";
import {
    AttachmentBar,
    useAttachment,
} from "@/app/(protected)/mail/@components/@reply/attachment";
import { type } from "arktype";
import { AiComposeButton } from "@/app/(protected)/mail/@components/@reply/ai-compose-button";
import { useQueryState } from "nuqs";
import { filterKeyEvents, htmlToText } from "@/lib/utils";
import { useSession } from "@/app/session-provider";
import { keys } from "@/lib/constants";

interface ReplyEditorProps {
    value: string;
    to: string[];
    subject: string;
    setSubject: (subject: string) => void;
    toValues: Option[];
    onToChange: (values: Option[]) => void;
    ccValues: Option[];
    onCcChange: (values: Option[]) => void;
    editor: Editor | null;
    handleSend: (value: string) => void | Promise<void>;
    isSending: boolean;
    defaultExpanded?: boolean;
}

export function ReplyEditor({
    to,
    value,
    editor,
    defaultExpanded,
    toValues,
    onToChange,
    ccValues,
    onCcChange,
    subject,
    setSubject,
    isSending,
    handleSend,
}: ReplyEditorProps) {
    const device = useDeviceType();
    const [expanded, setExpanded] = useState(defaultExpanded ?? false);
    const { user } = useSession();
    const { dropzone, onPaste, files } = useAttachment();
    const { selectedAccountId, selectedAccount } = useAccount();
    const [threadId] = useQueryState(keys.QueryParams.ActiveThread);
    const { data: emailAddresses } = api.emailAddress.list.useQuery({
        accountId: selectedAccountId,
        query: "",
    });
    const suggestions = emailAddresses?.map((s) => s.address) ?? [];
    const [thread] = api.thread.getThread.useSuspenseQuery({
        threadId: threadId ?? "",
        accountId: selectedAccountId,
    });

    const isButtonDisabled = () => {
        if (files.length > 0) return false;
        if (type("string>3")(editor?.getText()) instanceof type.errors)
            return true;
        if (toValues.length < 1) return true;
        return isSending;
    };

    const aiContext = useMemo(() => {
        return (
            thread?.emails
                .map((email) => htmlToText(email.body ?? ""))
                .reduce((prev, curr, idx) => {
                    return (
                        prev +
                        `Subject: ${thread?.emails[idx]?.subject ?? ""}
                      From: ${thread?.emails[idx]?.from?.name ?? ""}
                    ` +
                        curr +
                        "\n<!--email-separator-->" +
                        (idx === thread?.emails.length - 1
                            ? `
                         My name is ${user.firstName} ${user.lastName} and my email is ${selectedAccount?.emailAddress}
                        `
                            : "\n")
                    );
                }, "") ?? ""
        );
    }, [
        selectedAccount?.emailAddress,
        thread?.emails,
        user.firstName,
        user.lastName,
    ]);

    if (!editor) return null;

    return (
        <div
            className="max-h-[500px] relative w-full"
            {...dropzone.getRootProps()}
        >
            <AttachmentBar />
            <div className="flex p-4 py-2 border-b">
                <ReplyEditorMenuBar editor={editor} />
            </div>
            {dropzone.isDragActive && (
                <div className="absolute w-full h-full gap-4 z-10 rounded-lg border-2 border-dashed border-primary/50 flex items-center justify-center bg-muted">
                    <div className="-mt-6 rounded-full bg-background p-3 shadow-sm">
                        <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="-mt-6 text-muted-foreground">
                        DROP FILES HERE
                    </p>
                </div>
            )}
            <div className="w-full">
                <div className="p-4 pb-0 space-y-2 transition-all">
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                variants={expandedVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{
                                    bounce: 0,
                                }}
                            >
                                <EmailSelect
                                    suggestions={suggestions}
                                    label="To"
                                    value={toValues}
                                    onChange={onToChange}
                                />
                                <EmailSelect
                                    suggestions={suggestions}
                                    label="Cc"
                                    value={ccValues}
                                    onChange={onCcChange}
                                />
                                <Input
                                    id="subject"
                                    className="w-full"
                                    placeholder="Subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    onKeyDown={filterKeyEvents}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="flex justify-between items-center w-full">
                            <div className="flex gap-2 items-center">
                                <div
                                    className="cursor-pointer"
                                    onClick={() => setExpanded((e) => !e)}
                                >
                                    <span className="text-blue-500 font-medium">
                                        Draft{" "}
                                    </span>
                                    <span>to {to.join(", ")}</span>
                                </div>
                                <AiComposeButton
                                    isComposing={!!defaultExpanded}
                                    onGenerate={(text) => {
                                        editor?.commands.insertContent(text);
                                    }}
                                    context={aiContext}
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                onClick={dropzone.open}
                            >
                                <Paperclip className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="prose text-sm w-full max-h-full p-4">
                <EditorContent
                    editor={editor}
                    onKeyDown={filterKeyEvents}
                    value={value}
                    onPaste={onPaste}
                    className="text-sm max-w-full h-full max-h-[200px] overflow-auto"
                />
            </div>
            <Separator />
            <div className="py-3 px-4 flex items-center justify-between">
                <span className="text-sm">
                    Tip: Press{" "}
                    <KeyboardKey className="w-max">
                        {device === "iOS" || device === "Mac" ? "⌘" : "ctrl"}
                    </KeyboardKey>{" "}
                    + <KeyboardKey>Y</KeyboardKey> for AI autocomplete
                </span>
                <Button
                    onClick={async () => {
                        await handleSend(value);
                    }}
                    disabled={isButtonDisabled()}
                    className="w-16 font-semibold text-xs px-3 h-8"
                    effect="shine"
                >
                    {isSending ? <BarsLoader size={12} /> : "Send"}
                </Button>
            </div>
            <input {...dropzone.getInputProps()} />
        </div>
    );
}

const expandedVariants: Variants = {
    initial: {
        opacity: 0,
        y: 10,
    },
    animate: {
        opacity: 1,
        y: 0,
    },
    exit: {
        opacity: 0,
        y: 10,
    },
};

interface EmailSelectProps {
    suggestions: string[];
    placeholder?: string;
    label: string;
    onChange?: (values: Option[]) => void;
    value: Option[];
}

export function EmailSelect({
    label,
    value,
    suggestions,
    onChange,
}: EmailSelectProps) {
    const options = suggestions.map((s) => ({
        label: s,
        value: s,
    }));

    return (
        <div className="border rounded-md flex items-center mb-1">
            <span className="ml-3 text-sm text-muted-foreground">{label}</span>
            <MultipleSelector
                commandProps={{
                    label: "Select email",
                }}
                value={value}
                inputSchema={type("string.email")}
                defaultOptions={options}
                hidePlaceholderWhenSelected
                onChange={onChange}
                emptyIndicator={
                    <p className="text-center text-sm">No matches</p>
                }
                className="w-full border-none focus-within:border-none focus-within:ring-[0px]"
            />
        </div>
    );
}
