import { AnimatePresence, motion } from "motion/react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ButtonStates = "idle" | "loading" | "success";
type ButtonStateMapping = Record<ButtonStates, string | React.ReactNode>;

interface SubmitButtonProps extends ButtonProps {
    className?: string;
    buttonState: ButtonStates;
    buttonStateMapping: Partial<ButtonStateMapping>;
}

export function SubmitButton({
    className,
    buttonState,
    buttonStateMapping: {
        idle = "Submit",
        loading = <Loader size={12} />,
        success = "Submitted!",
    },
    type = "submit",
    ...props
}: SubmitButtonProps) {
    return (
        <Button
            className={className}
            disabled={buttonState === "loading"}
            type={type}
            {...props}
        >
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    transition={{
                        type: "spring",
                        bounce: 0,
                        duration: 0.3,
                    }}
                    initial={{ y: -25, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 25, opacity: 0 }}
                    key={buttonState}
                    className="flex w-full items-center justify-center"
                >
                    {buttonState === "idle" && idle}
                    {buttonState === "loading" && loading}
                    {buttonState === "success" && success}
                </motion.span>
            </AnimatePresence>
        </Button>
    );
}

function Loader({ size, className }: { size?: number; className?: string }) {
    return (
        <svg
            width={size ?? 24}
            height={size ?? 24}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("animate-spin", className)}
        >
            <rect x="22" width="4" height="12" rx="2" fill="#D9D9D9" />
            <rect x="22" y="36" width="4" height="12" rx="2" fill="#808080" />
            <rect
                y="26"
                width="4"
                height="12"
                rx="2"
                transform="rotate(-90 0 26)"
                fill="#BFBFBF"
            />
            <rect
                x="36"
                y="26"
                width="4"
                height="12"
                rx="2"
                transform="rotate(-90 36 26)"
                fill="#404040"
            />
            <rect
                x="5.61523"
                y="8.4436"
                width="4"
                height="12"
                rx="2"
                transform="rotate(-45 5.61523 8.4436)"
                fill="#CCCCCC"
            />
            <rect
                x="31.071"
                y="33.8995"
                width="4"
                height="12"
                rx="2"
                transform="rotate(-45 31.071 33.8995)"
                fill="#595959"
            />
            <rect
                x="8.4436"
                y="42.3848"
                width="4"
                height="12"
                rx="2"
                transform="rotate(-135 8.4436 42.3848)"
                fill="#999999"
            />
            <rect
                x="33.8994"
                y="16.9288"
                width="4"
                height="12"
                rx="2"
                transform="rotate(-135 33.8994 16.9288)"
                fill="#737373"
            />
        </svg>
    );
}
