import { Button } from "@/components/ui/button";

export function GithubButton() {
    return (
        <Button variant="outline" asChild>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
                href="/sign-in/github"
                className="flex w-full font-light text-sm text-muted-foreground dark:text-foreground items-center gap-2"
            >
                <img
                    src="https://img.clerk.com/static/github.svg?width=160"
                    alt="github"
                    width={16}
                    height={16}
                />
                Github
            </a>
        </Button>
    );
}
