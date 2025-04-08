import { useAccount } from "@/hooks/api/use-account";
import { api } from "@/trpc/react";

export function useMarkAsRead() {
    const { selectedAccountId } = useAccount();
    const utils = api.useUtils();
    const markMut = api.email.update.useMutation();
    return {
        ...markMut,
        mutate: function (
            emails: ({ id: string } | string)[],
            unread: boolean,
        ) {
            markMut.mutate(
                {
                    accountId: selectedAccountId,
                    emails: emails.map((emailOrId) => ({
                        messageId:
                            typeof emailOrId === "string"
                                ? emailOrId
                                : emailOrId.id,
                        unread,
                    })),
                },
                {
                    onSuccess() {
                        utils.thread.getThreads
                            .invalidate()
                            .catch(console.error);
                    },
                },
            );
        },
    };
}
