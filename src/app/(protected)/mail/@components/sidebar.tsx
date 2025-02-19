"use client";

import { FileIcon, InboxIcon, SendIcon, Trash2Icon } from "lucide-react";
import { type EmailLabel } from "@prisma/client";
import { NavItem } from "@/app/(protected)/mail/@components/nav-item";
import { useQueryState } from "nuqs";
import { type } from "arktype";

interface SidebarProps {
    isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
    const [tab] = useQueryState<EmailLabel>("tab", {
        defaultValue: "inbox",
        parse: (value) => {
            const parsed = type("'trash' | 'sent' | 'inbox' | 'draft'")(value);
            if (parsed instanceof type.errors) {
                return "inbox";
            }
            return parsed;
        },
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
                ]}
            />
            <div className="flex-1"></div>
        </>
    );
}
