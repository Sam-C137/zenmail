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
import { fToBase64 } from "@/lib/utils";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "@/hooks/api/use-account";
import { Link } from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";

export function ComposeButton() {
    const { files } = useAttachment();
    const [subject, setSubject] = useState("");
    const { AutoCompleteText, setAIContext } = useAIAutocompleteExtension();
    const [toValues, setToValues] = useState<Option[]>([]);
    const [ccValues, setCcValues] = useState<Option[]>([]);
    const [value, setValue] = useState("");
    const { toast } = useToast();
    const { selectedAccountId, selectedAccount } = useAccount();
    const sendEmail = api.thread.send.useMutation();

    const editor = useEditor({
        autofocus: false,
        extensions: [
            StarterKit,
            AutoCompleteText,
            Link,
            Color,
            TextStyle,
            Placeholder.configure({
                placeholder: `Hello...`,
            }),
        ],
        onUpdate({ editor }) {
            setValue(editor.getHTML());
        },
        immediatelyRender: false,
    });

    const handleSend = async (value: string) => {
        try {
            const attachments = await Promise.all(
                files.map(async (file) => ({
                    inline: true,
                    name: file.name,
                    mimeType: file.type,
                    contentId: crypto.randomUUID(),
                    content: await fToBase64(file),
                })),
            );
            sendEmail.mutate(
                {
                    accountId: selectedAccountId,
                    attachments,
                    body: value,
                    subject,
                    from: {
                        name: selectedAccount?.name,
                        address: selectedAccount?.emailAddress ?? "",
                    },
                    to: toValues.map((to) => ({
                        name: to.label,
                        address: to.value,
                    })),
                    cc: ccValues.map((cc) => ({
                        name: cc.label,
                        address: cc.value,
                    })),
                    replyTo: {
                        name: selectedAccount?.name,
                        address: selectedAccount?.emailAddress ?? "",
                    },
                },
                {
                    onSuccess: () => {
                        toast({
                            description: "Email sent",
                        });
                        editor?.commands.clearContent();
                    },
                    onError: (e) => {
                        toast({
                            variant: "destructive",
                            description: e.message,
                        });
                    },
                },
            );
        } catch (e) {
            console.error(e);
        }
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
                    isSending={sendEmail.isPending}
                    defaultExpanded
                />
            </DrawerContent>
        </Drawer>
    );
}
