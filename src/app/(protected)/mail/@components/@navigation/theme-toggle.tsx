"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

export function ThemeToggle() {
    const { resolvedTheme: theme, setTheme } = useTheme();

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => {
                setTheme(theme === "light" ? "dark" : "light");
            }}
            aria-label="Toggle theme"
        >
            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
    );
}
