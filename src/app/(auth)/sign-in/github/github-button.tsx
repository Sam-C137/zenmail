import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";

export function GithubButton() {
    return (
        <Button
            variant="outline"
            className="bg-white text-black hover:bg-gray-100 hover:text-black"
            asChild
        >
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
                href="/sign-in/github"
                className="flex w-full items-center gap-2"
            >
                <GithubIcon />
                Sign in with Github
            </a>
        </Button>
    );
}
