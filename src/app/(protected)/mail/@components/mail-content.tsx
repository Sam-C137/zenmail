"use client";

import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSwitcher } from "@/app/(protected)/mail/@components/account-switcher";
import { Sidebar } from "@/app/(protected)/mail/@components/@navigation/sidebar";
import { useQueryState } from "nuqs";
import { ThreadList } from "@/app/(protected)/mail/@components/@thread/thread-list";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThreadDisplay } from "@/app/(protected)/mail/@components/@thread-display/thread-display";
import { doneState } from "@/lib/state";

interface MailContentProps {
    defaultLayout?: [number, number, number];
    navCollapsedSize: number;
    defaultCollapsed?: boolean;
}
export function MailContent({
    defaultLayout = [20, 35, 45],
    navCollapsedSize,
    defaultCollapsed = false,
}: MailContentProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    const [done, setDone] = useQueryState(...doneState);

    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes) => {
                    void sizes;
                }}
                className="items-stretch h-screen max-h-screen"
            >
                <ResizablePanel
                    defaultSize={defaultLayout[0]}
                    collapsedSize={navCollapsedSize}
                    collapsible
                    minSize={15}
                    maxSize={40}
                    onCollapse={() => {
                        setIsCollapsed(true);
                    }}
                    onResize={(size) => {
                        setIsCollapsed(false);
                        void size;
                    }}
                    className={cn(
                        isCollapsed &&
                            "min-w-[50px] transition-all duration-300 ease-in-out",
                    )}
                >
                    <div className="flex relative flex-col h-full flex-1">
                        <div
                            className={cn(
                                "flex h-[52px] items-center justify-center",
                                isCollapsed ? "h-[52px]" : "px-2",
                            )}
                        >
                            <AccountSwitcher isCollapsed={isCollapsed} />
                        </div>
                        <Separator />
                        <Sidebar isCollapsed={isCollapsed} />
                        Ask AI
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                    <Tabs
                        className="flex flex-col h-screen max-h-screen"
                        defaultValue={done.toString()}
                        onValueChange={(done) => setDone(done === "true")}
                    >
                        <div className="flex-none">
                            <div className="flex items-center px-4 py-2">
                                <h1 className="text-xl font-bold">Inbox</h1>
                                <TabsList className="ml-auto">
                                    <TabsTrigger value="false">
                                        Inbox
                                    </TabsTrigger>
                                    <TabsTrigger value="true">Done</TabsTrigger>
                                </TabsList>
                            </div>
                            <Separator />
                            Search bar
                        </div>
                        <ScrollArea className="h-full">
                            <Scrollbar />
                            <TabsContent value="false">
                                <ThreadList done={done} />
                            </TabsContent>
                            <TabsContent value="true">
                                <ThreadList done={done} />
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                    defaultSize={defaultLayout[2]}
                    minSize={30}
                    className="flex-1"
                >
                    <ThreadDisplay />
                </ResizablePanel>
            </ResizablePanelGroup>
        </TooltipProvider>
    );
}
