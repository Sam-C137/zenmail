import { Button } from "@/components/ui/button";

export function GoogleButton() {
    return (
        <Button variant="outline" asChild>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
                href="/sign-in/google"
                className="flex w-full font-light text-sm dark:text-foreground text-muted-foreground items-center gap-2"
            >
                <img
                    src="/static/google-icon.svg"
                    alt="google"
                    width={16}
                    height={16}
                />
                Google
            </a>
        </Button>
    );
}
