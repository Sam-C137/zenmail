import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

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
        loading = <Loader2 className="animate-spin" size={12} />,
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
