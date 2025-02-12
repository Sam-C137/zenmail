"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTheme } from "next-themes";

export function GoogleButton() {
    const { resolvedTheme } = useTheme();
    const icon =
        resolvedTheme === "dark" ? "google-icon.svg" : "google-icon-mono.svg";

    return (
        <Button variant="outline" asChild>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/sign-in/google" className="flex w-full items-center">
                <Image
                    src={`/static/${icon}`}
                    alt="google"
                    width={16}
                    height={16}
                    unoptimized
                />
            </a>
        </Button>
    );
}
