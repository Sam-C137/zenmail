import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scrollbar } from "@radix-ui/react-scroll-area";

interface MailLoadingPageProps {
    isInitialSync?: boolean;
}

export default function MailLoadingPage({
    isInitialSync,
}: MailLoadingPageProps) {
    return (
        <>
            {isInitialSync && (
                <>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40" />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <p className="text-2xl md:text-3xl font-medium text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 animate-pulse">
                            Please wait while we sync your emails
                            <span className="block">
                                This could take a while
                                <span className="dots-loader inline-block ml-8"></span>
                            </span>
                        </p>
                    </div>
                </>
            )}
            <ResizablePanelGroup
                direction="horizontal"
                className="h-screen max-h-screen"
            >
                <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                    <div className="flex flex-col h-full">
                        <div className="flex h-[56px] items-center justify-center px-2">
                            <Skeleton className="h-6 w-[80%]" />
                        </div>
                        <Separator />
                        <div className="flex flex-col space-y-2 p-2">
                            {[...Array<unknown>(4)].map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                        <div className="flex-1" />
                        <div className="p-2">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={30}>
                    <div className="flex flex-col h-full max-h-screen">
                        <div className="flex-none">
                            <div className="flex items-center justify-between px-4 py-3">
                                <Skeleton className="h-8 w-24" />
                                <div className="flex space-x-2">
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-8 w-20" />
                                </div>
                            </div>
                            <Separator />
                            <div className="p-4">
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                        <ScrollArea>
                            <Scrollbar />
                            <div className="p-4 space-y-4">
                                {[...Array<unknown>(12)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col space-y-3 rounded-lg border bg-card p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                        <div className="flex space-x-2">
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                            <Skeleton className="h-6 w-20 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={30}>
                    <div className="flex flex-col h-full p-4 space-y-4">
                        <Skeleton className="h-8 w-[50%]" />
                        <Skeleton className="h-4 w-[80%]" />
                        <Skeleton className="h-4 w-[70%]" />
                        <Skeleton className="h-4 w-[75%]" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-4 w-[60%]" />
                        <Skeleton className="h-4 w-[65%]" />
                        <Skeleton className="h-4 w-[70%]" />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </>
    );
}
