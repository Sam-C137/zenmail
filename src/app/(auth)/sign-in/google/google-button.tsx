"use client";

import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";

export function GoogleButton() {
    return (
        <Button variant="outline" asChild>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/sign-in/google" className="flex w-full items-center">
                <GoogleIcon />
            </a>
        </Button>
    );
}
