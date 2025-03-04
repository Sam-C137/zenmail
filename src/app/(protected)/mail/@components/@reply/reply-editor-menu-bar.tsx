import {
    Bold,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    Italic,
    List,
    ListOrdered,
    Quote,
    Redo,
    Strikethrough,
    Undo,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

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
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 4 }).run()
                }
                className={cn(
                    "p-1 rounded-sm",
                    editor.isActive("heading", { level: 4 }) && "bg-muted",
                )}
            >
                <Heading4 className="size-4 text-secondary-foreground" />
            </button>
            <button
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 5 }).run()
                }
                className={cn(
                    "p-1 rounded-sm",
                    editor.isActive("heading", { level: 5 }) && "bg-muted",
                )}
            >
                <Heading5 className="size-4 text-secondary-foreground" />
            </button>
            <button
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 6 }).run()
                }
                className={cn(
                    "p-1 rounded-sm",
                    editor.isActive("heading", { level: 6 }) && "bg-muted",
                )}
            >
                <Heading6 className="size-4 text-secondary-foreground" />
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
