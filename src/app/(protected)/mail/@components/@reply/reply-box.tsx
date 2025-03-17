import { ReplyEditor } from "@/app/(protected)/mail/@components/@reply/reply-editor";
import { useAccount } from "@/hooks/api/use-account";
import { api } from "@/trpc/react";
import { useState } from "react";
import { type Option } from "@/components/ui/multiselect";
import { useToast } from "@/hooks/use-toast";
import { useAttachment } from "@/app/(protected)/mail/@components/@reply/attachment";
import { fToBase64, processAICompletion, streamAIOutput } from "@/lib/utils";
import { Text } from "@tiptap/extension-text";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { suggestAutocomplete } from "@/app/(protected)/mail/@components/@reply/actions";

interface ReplyBoxProps {
    threadId: string;
}

export function ReplyBox({ threadId }: ReplyBoxProps) {
    const { selectedAccountId } = useAccount();
    const { toast } = useToast();
    const replyMutation = api.thread.reply.useMutation();
    const [replyDetails] = api.thread.getReplyDetails.useSuspenseQuery({
        accountId: selectedAccountId,
        threadId,
        replyType: "reply",
    });

    const { files } = useAttachment();
    const [subject, setSubject] = useState(
        replyDetails?.subject.startsWith("Re:")
            ? replyDetails.subject
            : `Re: ${replyDetails?.subject}`,
    );
    const [toValues, setToValues] = useState<Option[]>(
        replyDetails?.to.map((to) => ({
            label: to.address,
            value: to.address,
        })) ?? [],
    );
    const [ccValues, setCcValues] = useState<Option[]>(
        replyDetails?.cc.map((cc) => ({
            label: cc.address,
            value: cc.address,
        })) ?? [],
    );
    const [value, setValue] = useState("");
    const placeHolderName = replyDetails?.to.at(-1)?.name ?? "";

    const autoComplete = async (value: string) => {
        const { error, output } = await suggestAutocomplete(value);
        if (error || !output) return "";
        let out = "";
        for await (const line of streamAIOutput(output)) {
            out += line;
        }
        return out;
    };

    const AutoCompleteText = Text.extend({
        addKeyboardShortcuts() {
            return {
                "Mod-y": ({ editor }) => {
                    autoComplete(editor.getText())
                        .then((value) => {
                            if (value) {
                                editor.commands.setContent(
                                    processAICompletion(
                                        editor.getText(),
                                        value,
                                    ),
                                );
                            }
                        })
                        .catch(console.warn);
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

    if (!replyDetails) return null;

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
            replyMutation.mutate(
                {
                    accountId: selectedAccountId,
                    threadId,
                    attachments,
                    body: value,
                    subject,
                    from: replyDetails.from,
                    to: replyDetails.to.map((to) => ({
                        name: to.name ?? to.address,
                        address: to.address,
                    })),
                    cc: replyDetails.cc.map((cc) => ({
                        name: cc.name ?? cc.address,
                        address: cc.address,
                    })),
                    replyTo: replyDetails.from,
                    inReplyTo: replyDetails.internetMessageId,
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
        <ReplyEditor
            editor={editor}
            value={value}
            to={toValues.map((to) => to.value)}
            toValues={toValues}
            onToChange={setToValues}
            ccValues={ccValues}
            onCcChange={setCcValues}
            subject={subject}
            setSubject={setSubject}
            handleSend={handleSend}
            isSending={replyMutation.isPending}
        />
    );
}
