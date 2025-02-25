"use client";

import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const GithubIcon = dynamic(
    () => import("@/components/ui/github-icon").then((mod) => mod.GithubIcon),
    {
        ssr: false,
    },
);

export function GithubButton() {
    return (
        <Button variant="outline" asChild>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/sign-in/github" className="flex w-full items-center">
                <GithubIcon />
            </a>
        </Button>
    );
}
