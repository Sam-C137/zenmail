import { Button } from "@/components/ui/button";
import { MicrosoftIcon } from "@/components/ui/microsoft-icon";

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
