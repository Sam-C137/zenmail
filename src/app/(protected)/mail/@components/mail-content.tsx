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
import { Sidebar } from "@/app/(protected)/mail/@components/sidebar";

interface MailContentProps {
    defaultLayout?: [number, number, number];
    navCollapsedSize: number;
    defaultCollapsed?: boolean;
}
export function MailContent({
    defaultLayout = [20, 32, 48],
    navCollapsedSize,
    defaultCollapsed = false,
}: MailContentProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes) => {
                    void sizes;
                }}
                className="items-stretch h-full min-h-screen"
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
                    <div className="flex flex-col h-full flex-1">
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
                <ResizablePanel
                    defaultSize={defaultLayout[1]}
                    minSize={30}
                    className="flex-1"
                >
                    <Tabs defaultValue="inbox">
                        <div className="flex items-center px-4 py-2">
                            <h1 className="text-xl font-bold">Inbox</h1>
                            <TabsList className="ml-auto">
                                <TabsTrigger value="inbox">Inbox</TabsTrigger>
                                <TabsTrigger value="done">Done</TabsTrigger>
                            </TabsList>
                        </div>
                        <Separator />
                        Search bar
                        <TabsContent value="inbox">Inbox content</TabsContent>
                        <TabsContent value="done">Done content</TabsContent>
                    </Tabs>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                    defaultSize={defaultLayout[2]}
                    minSize={30}
                    className="flex-1"
                >
                    Thread content
                </ResizablePanel>
            </ResizablePanelGroup>
        </TooltipProvider>
    );
}
