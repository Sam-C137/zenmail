"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Text } from "@tiptap/extension-text";
import { useState } from "react";
import { ReplyEditorMenuBar } from "./reply-editor-menu-bar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useDeviceType } from "@/hooks/use-device-type";
import { KeyboardKey } from "@/components/ui/keyboard-key";
import { AnimatePresence, motion } from "motion/react";
import { Placeholder } from "@tiptap/extension-placeholder";
import { MultipleSelector, type Option } from "@/components/ui/multiselect";
import { Input } from "@/components/ui/input";
import { useAccount } from "@/hooks/api/use-account";
import { api } from "@/trpc/react";
import { BarsLoader } from "@/app/(auth)/@components/submit-button";

interface ReplyEditorProps {
    placeHolderName: string;
    to: string[];
    subject: string;
    setSubject: (subject: string) => void;
    toValues: Option[];
    onToChange: (values: Option[]) => void;
    ccValues: Option[];
    onCcChange: (values: Option[]) => void;

    handleSend: (value: string) => void;
    isSending: boolean;
    defaultExpanded?: boolean;
}

export function ReplyEditor({
    placeHolderName,
    to,
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
    const [value, setValue] = useState("");
    const [expanded, setExpanded] = useState(defaultExpanded ?? false);
    const device = useDeviceType();
    const { selectedAccountId } = useAccount();
    const { data } = api.emailAddress.list.useQuery({
        accountId: selectedAccountId,
        query: "",
    });
    const suggestions = data?.map((s) => s.address) ?? [];
    const AutoCompleteText = Text.extend({
        addKeyboardShortcuts() {
            return {
                "Meta-j": () => {
                    return true;
                },
            };
        },
    });

    const editor = useEditor({
        autofocus: false,
        extensions: [
            StarterKit,
            AutoCompleteText,
            Placeholder.configure({
                placeholder: `Reply ${placeHolderName}...`,
            }),
        ],
        onUpdate({ editor }) {
            setValue(editor.getHTML());
        },
        immediatelyRender: false,
    });

    if (!editor) return null;

    return (
        <div className="max-h-[500px] w-full">
            <div className="flex p-4 py-2 border-b">
                <ReplyEditorMenuBar editor={editor} />
            </div>

            <div className="w-full">
                <div className="p-4 pb-0 space-y-2 transition-all">
                    <AnimatePresence initial={false}>
                        {expanded && (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: 10,
                                }}
                                transition={{
                                    bounce: 0,
                                }}
                            >
                                <>
                                    <TagSelect
                                        suggestions={suggestions}
                                        label="To"
                                        value={toValues}
                                        onChange={onToChange}
                                    />
                                    <TagSelect
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
                                        onChange={(e) =>
                                            setSubject(e.target.value)
                                        }
                                    />
                                </>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="flex items-center gap-2 text-sm">
                        <div
                            className="cursor-pointer"
                            onClick={() => setExpanded((e) => !e)}
                        >
                            <span className="text-blue-500 font-medium">
                                Draft{" "}
                            </span>
                            <span>to {to.join(", ")}</span>
                        </div>
                        {/*  Ai compose  */}
                    </div>
                </div>
            </div>

            <div className="prose text-sm w-full max-h-full p-4">
                <EditorContent
                    editor={editor}
                    onKeyDown={(e) => e.stopPropagation()}
                    value={value}
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
                    <KeyboardKey>J</KeyboardKey> for AI autocomplete
                </span>
                <Button
                    onClick={() => {
                        handleSend(value);
                        editor?.commands.clearContent();
                    }}
                    disabled={value.trim() === "<p></p>" || isSending}
                    className="w-16"
                >
                    {isSending ? <BarsLoader size={12} /> : "Send"}
                </Button>
            </div>
        </div>
    );
}

interface TagSelectProps {
    suggestions: string[];
    placeholder?: string;
    label: string;
    onChange?: (values: Option[]) => void;
    value: Option[];
}

export function TagSelect({
    label,
    value,
    suggestions,
    onChange,
}: TagSelectProps) {
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
