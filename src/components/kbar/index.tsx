"use client";

import {
    KBarAnimator,
    KBarPortal,
    KBarPositioner,
    KBarProvider,
    KBarSearch,
} from "kbar";
import { KBarResults } from "@/components/kbar/kbar-results";
import { useActions } from "@/components/kbar/use-actions";

export default function KBar({ children }: React.PropsWithChildren) {
    const [actions] = useActions();

    return (
        <KBarProvider actions={actions}>
            <CommandBar>{children}</CommandBar>
        </KBarProvider>
    );
}

export function CommandBar({ children }: React.PropsWithChildren) {
    return (
        <>
            <KBarPortal>
                <KBarPositioner className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm scrollbar-hide !p-0 z-[99999]">
                    <KBarAnimator className="max-w-[500px] !mt-[30vh] w-full text-foreground bg-background shadow-lg border rounded-lg overflow-hidden relative !-translate-y-12">
                        <div className="bg-background">
                            <div
                                window-bar-label="true"
                                className="border-x-0 flex items-center rounded-md px-2 shadow-sm dark:shadow-[0_0_0_1px_#2e2e2e] duration-100 transition-shadow focus-within:shadow-sm dark:focus-within:shadow-[0_0_0_1px_#505050]"
                            >
                                <KBarSearch className="w-full c block relative border-none bg-background dark:text-[#a0a0a0] h-[32px] px-2 text-sm outline-none text-ellipsis overflow-hidden whitespace-nowrap" />
                            </div>
                            <KBarResults />
                        </div>
                    </KBarAnimator>
                </KBarPositioner>
            </KBarPortal>
            {children}
        </>
    );
}
