import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/ui/github-icon";

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
