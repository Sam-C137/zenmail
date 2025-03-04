import { ReplyEditor } from "@/app/(protected)/mail/@components/@reply/reply-editor";
import { useAccount } from "@/hooks/api/use-account";
import { api } from "@/trpc/react";
import { useMemo, useState } from "react";
import { type Option } from "@/components/ui/multiselect";
import { useToast } from "@/hooks/use-toast";

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
    const initialSubject = replyDetails?.subject.startsWith("Re:")
        ? replyDetails.subject
        : `Re: ${replyDetails?.subject}`;

    const initialToValues =
        replyDetails?.to.map((to) => ({
            label: to.address,
            value: to.address,
        })) ?? [];

    const initialCcValues =
        replyDetails?.cc.map((cc) => ({
            label: cc.address,
            value: cc.address,
        })) ?? [];

    const [subject, setSubject] = useState(initialSubject);
    const [toValues, setToValues] = useState<Option[]>(initialToValues);
    const [ccValues, setCcValues] = useState<Option[]>(initialCcValues);
    const placeHolderName = replyDetails?.to.at(-1)?.name ?? "";

    useMemo(() => {
        setSubject(initialSubject);
        setToValues(initialToValues);
        setCcValues(initialCcValues);
    }, [replyDetails]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!replyDetails) return null;

    const handleSend = (value: string) => {
        replyMutation.mutate(
            {
                accountId: selectedAccountId,
                threadId,
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
                },
            },
        );
    };

    return (
        <ReplyEditor
            key={threadId}
            placeHolderName={placeHolderName}
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
