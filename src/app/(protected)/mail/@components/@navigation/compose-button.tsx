"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { useAttachment } from "@/app/(protected)/mail/@components/@reply/attachment";
import { useState } from "react";
import type { Option } from "@/components/ui/multiselect";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useAIAutocompleteExtension } from "@/hooks/use-ai-autocomplete-extension";
import { ReplyEditor } from "@/app/(protected)/mail/@components/@reply/reply-editor";

export function ComposeButton() {
    const { files } = useAttachment();
    const [subject, setSubject] = useState("");
    const { AutoCompleteText, setAIContext } = useAIAutocompleteExtension();
    const [toValues, setToValues] = useState<Option[]>([]);
    const [ccValues, setCcValues] = useState<Option[]>([]);
    const [value, setValue] = useState("");

    const editor = useEditor({
        autofocus: false,
        extensions: [
            StarterKit,
            AutoCompleteText,
            Placeholder.configure({
                placeholder: `Hello...`,
            }),
        ],
        onUpdate({ editor }) {
            setValue(editor.getHTML());
        },
        immediatelyRender: false,
    });

    const handleSend = () => {
        console.log("handlesend");
    };

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline">
                    <Pencil className="size-4" />
                    Compose
                </Button>
            </DrawerTrigger>
            <DrawerContent className="max-w-4xl mx-auto">
                <DrawerHeader className="w-max mx-auto sm:w-full">
                    <DrawerTitle>Compose an email</DrawerTitle>
                    <DrawerDescription className="sr-only">
                        Create a new email to send to your contacts.
                    </DrawerDescription>
                </DrawerHeader>
                <ReplyEditor
                    editor={editor}
                    value={value}
                    to={toValues.map((to) => to.value)}
                    toValues={toValues}
                    onToChange={setToValues}
                    ccValues={ccValues}
                    onCcChange={setCcValues}
                    subject={subject}
                    setSubject={(subject) => {
                        setSubject(subject);
                        setAIContext(`Subject: ${subject}`);
                    }}
                    handleSend={handleSend}
                    isSending={false}
                    defaultExpanded
                />
            </DrawerContent>
        </Drawer>
    );
}
