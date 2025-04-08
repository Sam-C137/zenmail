import { useCallback, useMemo, useState } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/use-Isomorphic-layout-effect";
import { Editor } from "@tiptap/react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { type } from "arktype";

export function useEditorLink(editor: Editor) {
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
    const isInvalid = useMemo(
        () => type("string.url")(linkUrl) instanceof type.errors,
        [linkUrl],
    );
    const Comp = useMemo(() => {
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
    }, [isInvalid, isActive, editor, linkOpen, linkUrl, setLink]);

    return { Comp, setLink, linkOpen, setLinkOpen, linkUrl, setLinkUrl };
}
