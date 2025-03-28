"use client";

import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const MicrosoftIcon = dynamic(
    () =>
        import("@/components/ui/microsoft-icon").then(
            (mod) => mod.MicrosoftIcon,
        ),
    { ssr: false },
);

export function MicrosoftButton() {
    return (
        <Button variant="outline" asChild>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/sign-in/microsoft" className="flex w-full items-center">
                <MicrosoftIcon />
            </a>
        </Button>
    );
}
