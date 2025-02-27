"use client";

import { FileIcon, InboxIcon, SendIcon, Star, Trash2Icon } from "lucide-react";
import { NavItem } from "@/app/(protected)/mail/@components/@navigation/nav-item";
import { useQueryState } from "nuqs";
import { ThemeToggle } from "@/app/(protected)/mail/@components/@navigation/theme-toggle";

interface SidebarProps {
    isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
    const [tab] = useQueryState("tab", {
        defaultValue: "inbox",
    });

    return (
        <>
            <NavItem
                isCollapsed={isCollapsed}
                links={[
                    {
                        title: "Inbox",
                        icon: InboxIcon,
                        active: tab === "inbox",
                        value: "inbox",
                    },
                    {
                        title: "Drafts",
                        icon: FileIcon,
                        active: tab === "draft",
                        value: "draft",
                    },
                    {
                        title: "Sent",
                        icon: SendIcon,
                        active: tab === "sent",
                        value: "sent",
                    },
                    {
                        title: "Trash",
                        icon: Trash2Icon,
                        active: tab === "trash",
                        value: "trash",
                    },
                    {
                        title: "Starred",
                        icon: Star,
                        active: tab === "starred",
                        value: "starred",
                    },
                ]}
            />
            <div className="flex-1"></div>
            <ThemeToggle />
        </>
    );
}
