import React from "react";
import { cn } from "@/lib/utils";

export interface KeyboardKeyProps extends React.PropsWithChildren {
    className?: string;
}

const KeyboardKey = React.forwardRef<HTMLElement, KeyboardKeyProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <kbd
                ref={ref}
                {...props}
                className={cn(
                    "inline-flex w-6 h-6 items-center justify-center rounded border border-border px-1 py-0.5 font-medium text-muted-foreground/70",
                    className,
                )}
            >
                {children}
            </kbd>
        );
    },
);
KeyboardKey.displayName = "KeyboardKey";

export { KeyboardKey };
