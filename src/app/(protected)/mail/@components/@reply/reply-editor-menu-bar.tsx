import {
    Bold,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Italic,
    LinkIcon,
    List,
    ListOrdered,
    Quote,
    Redo,
    Strikethrough,
    Undo,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/use-Isomorphic-layout-effect";
import { type } from "arktype";

interface ReplyEditorMenuBarProps {
    editor: Editor;
}

export function ReplyEditorMenuBar({ editor }: ReplyEditorMenuBarProps) {
    return (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={cn(
                    "p-1 rounded-sm",
                    editor.isActive("bold") && "bg-muted",
                )}
            >
                <Bold className="size-4 text-secondary-foreground" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={cn(
                    "p-1 rounded-sm",
                    editor.isActive("italic") && "bg-muted",
                )}
            >
                <Italic className="size-4 text-secondary-foreground" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={cn(
                    "p-1 rounded-sm",
                    editor.isActive("strike") && "bg-muted",
                )}
            >
                <Strikethrough className="size-4 text-secondary-foreground" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                className={cn(
                    "p-1 rounded-sm",
                    editor.isActive("code") && "bg-muted",
                )}
            >
                <Code className="size-4 text-secondary-foreground" />
            </button>
            <button
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={cn(
                    "p-1 rounded-sm",
                    editor.isActive("heading", { level: 1 }) && "bg-muted",
                )}
            >
                <Heading1 className="size-4 text-secondary-foreground" />
            </button>
            <button
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={cn(
                    "p-1 rounded-sm",
                    editor.isActive("heading", { level: 2 }) && "bg-muted",
                )}
            >
                <Heading2 className="size-4 text-secondary-foreground" />
            </button>
            <button
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={cn(
                    "p-1 rounded-sm",
                    editor.isActive("heading", { level: 3 }) && "bg-muted",
                )}
            >
                <Heading3 className="size-4 text-secondary-foreground" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                    "p-1 rounded-sm",
                    editor.isActive("bulletList") && "bg-muted",
                )}
            >
                <List className="size-4 text-secondary-foreground" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                    "p-1 rounded-sm",
                    editor.isActive("orderedList") && "bg-muted",
                )}
            >
                <ListOrdered className="size-4 text-secondary-foreground" />
            </button>
            <EditorLink editor={editor} />
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(
                    "p-1 rounded-sm",
                    editor.isActive("blockquote") && "bg-muted",
                )}
            >
                <Quote className="size-4 text-secondary-foreground" />
            </button>
            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-1 rounded-sm"
            >
                <Undo className="size-4 text-secondary-foreground" />
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-1 rounded-sm"
            >
                <Redo className="size-4 text-secondary-foreground" />
            </button>
        </div>
    );
}

function EditorLink({ editor }: ReplyEditorMenuBarProps) {
    const [linkUrl, setLinkUrl] = useState<string>("");
    const [linkOpen, setLinkOpen] = useState<boolean>(false);

    useIsomorphicLayoutEffect(() => {
        if (linkOpen && editor.isActive("link")) {
            setLinkUrl((editor.getAttributes("link").href as string) || "");
        } else if (linkOpen) {
            setLinkUrl("");
        }
    }, [linkOpen, editor]);

    const setLink = useCallback(() => {
        if (editor.state.selection.empty) {
            return;
        }

        if (!linkUrl) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            setLinkOpen(false);
            return;
        }

        const url =
            linkUrl.startsWith("http://") || linkUrl.startsWith("https://")
                ? linkUrl
                : `https://${linkUrl}`;

        editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        setLinkOpen(false);
    }, [editor, linkUrl]);

    const isActive = editor.isActive("link");
    const isInvalid = type("string.url")(linkUrl) instanceof type.errors;
    return (
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn("p-1 rounded-sm", isActive && "bg-muted")}
                >
                    <LinkIcon className="size-4 text-secondary-foreground" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
                <div className="flex flex-col gap-2">
                    <Input
                        placeholder="Enter URL"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                if (isInvalid) return;
                                e.preventDefault();
                                setLink();
                            }
                        }}
                    />
                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                editor.chain().focus().unsetLink().run();
                                setLinkOpen(false);
                            }}
                            disabled={!isActive || isInvalid}
                        >
                            Remove Link
                        </Button>
                        <Button
                            size="sm"
                            onClick={setLink}
                            disabled={editor.state.selection.empty}
                        >
                            Add Link
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
