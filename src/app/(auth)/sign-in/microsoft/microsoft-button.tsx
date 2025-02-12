"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTheme } from "next-themes";

export function MicrosoftButton() {
    const { resolvedTheme } = useTheme();
    const icon =
        resolvedTheme === "dark"
            ? "microsoft-icon.svg"
            : "microsoft-icon-mono.svg";

    return (
        <Button variant="outline" asChild>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/sign-in/microsoft" className="flex w-full items-center">
                <Image
                    src={`/static/${icon}`}
                    alt="microsoft"
                    width={16}
                    height={16}
                    unoptimized
                />
            </a>
        </Button>
    );
}
