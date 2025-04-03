import { useQueryState } from "nuqs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetThreads } from "@/hooks/api/use-get-threads";
import { ThreadDisplayHeader } from "@/app/(protected)/mail/@components/@thread-display/thread-display-header";
import { Accordion } from "@/components/ui/accordion";
import { ThreadDisplayEmail } from "@/app/(protected)/mail/@components/@thread-display/thread-display-email";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ReplyBox } from "@/app/(protected)/mail/@components/@reply/reply-box";
import { Suspense } from "react";
import { AttachmentContextProvider } from "@/app/(protected)/mail/@components/@reply/attachment";
import { keys } from "@/lib/constants";
import { api } from "@/trpc/react";
import { useLocalStorage } from "@/hooks/use-localstorage";

export function ThreadDisplay() {
    const [threadId] = useQueryState(keys.QueryParams.ActiveThread);
    const [accountId] = useLocalStorage(
        keys.LocalStorage.SelectedAccountId,
        "",
    );
    const { data: thread, isPending } = api.thread.getThread.useQuery(
        {
            accountId,
            threadId: threadId ?? "",
        },
        {
            enabled: !!threadId,
        },
    );

    if (!threadId) {
        return (
            <div className="h-full w-full">
                <div className="flex items-center justify-center h-full w-full">
                    <p className="text-muted-foreground">
                        Select a thread to view
                    </p>
                </div>
            </div>
        );
    }

    if (isPending) return <ThreadDisplayLoading />;

    if (!thread) {
        return (
            <div className="h-full w-full">
                <div className="flex items-center justify-center h-full w-full">
                    <p className="text-muted-foreground">No thread found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-h-screen">
            <ThreadDisplayHeader />
            <Separator />
            <ScrollArea>
                <ScrollBar orientation="vertical" />
                <ScrollBar orientation="horizontal" />
                <Accordion
                    type="single"
                    defaultValue={thread.emails.at(0)?.id}
                    collapsible
                    className="w-full flex-1"
                    key={thread.emails.at(0)?.id}
                >
                    {thread.emails.map((mail) => (
                        <ThreadDisplayEmail
                            single={thread.emails.length === 1}
                            email={mail}
                            key={mail.id}
                        />
                    ))}
                </Accordion>
            </ScrollArea>
            <Separator className="mt-auto" />
            <Suspense fallback={<ReplyBoxLoading />}>
                <AttachmentContextProvider>
                    <ReplyBox key={threadId} threadId={threadId} />
                </AttachmentContextProvider>
            </Suspense>
        </div>
    );
}

function ThreadDisplayLoading() {
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center p-2.5">
                <div className="flex items-center gap-2">
                    {[...Array<unknown>(4)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-8" />
                    ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {[...Array<unknown>(3)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-8" />
                    ))}
                </div>
                <Separator orientation="vertical" className="mx-2 h-6" />
                <Skeleton className="h-8 w-8" />
            </div>
            <Separator />
            <div className="flex flex-1 flex-col">
                <div className="flex items-start p-4">
                    <div className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-64" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                    <div className="ml-auto">
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <Separator />
                <div className="flex-1 p-4 space-y-4">
                    {[...Array<unknown>(5)].map((_, i) => (
                        <Skeleton key={i} className="h-3 w-full" />
                    ))}
                </div>
                <Separator className="mt-auto" />
                <ReplyBoxLoading />
            </div>
        </div>
    );
}

function ReplyBoxLoading() {
    return (
        <div className="p-4 space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-16" />
            </div>
        </div>
    );
}
