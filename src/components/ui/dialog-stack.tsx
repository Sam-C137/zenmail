"use client";

import {
    Children,
    cloneElement,
    createContext,
    useContext,
    useEffect,
    useState,
    forwardRef,
    type ButtonHTMLAttributes,
    type Dispatch,
    type HTMLAttributes,
    type MouseEventHandler,
    type ReactElement,
    type SetStateAction,
} from "react";
import * as Portal from "@radix-ui/react-portal";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type DialogStackContextType = {
    activeIndex: number;
    setActiveIndex: Dispatch<SetStateAction<number>>;
    totalDialogs: number;
    setTotalDialogs: Dispatch<SetStateAction<number>>;
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    clickable: boolean;
};

const DialogStackContext = createContext<DialogStackContextType>({
    activeIndex: 0,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setActiveIndex: () => {},
    totalDialogs: 0,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setTotalDialogs: () => {},
    isOpen: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setIsOpen: () => {},
    clickable: false,
});

type DialogStackChildProps = {
    index?: number;
};

const DialogStack = ({
    children,
    className,
    open = false,
    onOpenChange,
    clickable = false,
    controls,
    ...props
}: HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    clickable?: boolean;
    onOpenChange?: (open: boolean) => void;
    controls?: {
        activeIdx?: number;
        setActiveIdx?: Dispatch<SetStateAction<number>>;
    };
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(open);

    useEffect(() => {
        onOpenChange?.(isOpen);
    }, [isOpen, onOpenChange]);

    return (
        <DialogStackContext.Provider
            value={{
                activeIndex: controls?.activeIdx ?? activeIndex,
                setActiveIndex: controls?.setActiveIdx ?? setActiveIndex,
                totalDialogs: 0,
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                setTotalDialogs: () => {},
                isOpen,
                setIsOpen,
                clickable,
            }}
        >
            <div className={className} {...props}>
                {children}
            </div>
        </DialogStackContext.Provider>
    );
};

const DialogStackTrigger = forwardRef<
    HTMLButtonElement,
    ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, className, onClick, asChild, ...props }, ref) => {
    const context = useContext(DialogStackContext);

    if (!context) {
        throw new Error("DialogStackTrigger must be used within a DialogStack");
    }

    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        context.setIsOpen(true);
        onClick?.(e);
    };

    if (asChild && children) {
        return cloneElement(children as ReactElement, {
            onClick: handleClick,
            className: cn(
                className,
                (
                    (children as ReactElement).props as {
                        className?: string;
                    }
                ).className,
            ),
            ...props,
        });
    }

    return (
        <button
            onClick={handleClick}
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
                "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "h-10 px-4 py-2",
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
});
DialogStackTrigger.displayName = "DialogStackTrigger";

const DialogStackOverlay = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const context = useContext(DialogStackContext);

    if (!context) {
        throw new Error("DialogStackOverlay must be used within a DialogStack");
    }

    if (!context.isOpen) {
        return null;
    }

    return (
        <div
            ref={ref}
            className={cn(
                "fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                className,
            )}
            onClick={() => context.setIsOpen(false)}
            {...props}
            aria-hidden="true"
            data-aria-hidden="true"
            data-state={context.isOpen ? "open" : "closed"}
            tabIndex={-1}
        />
    );
});
DialogStackOverlay.displayName = "DialogStackOverlay";

const DialogStackBody = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement> & {
        children:
            | ReactElement<DialogStackChildProps>[]
            | ReactElement<DialogStackChildProps>
            | React.ReactNode;
    }
>(({ children, className, ...props }, ref) => {
    const context = useContext(DialogStackContext);
    const [totalDialogs, setTotalDialogs] = useState(Children.count(children));

    if (!context) {
        throw new Error("DialogStackBody must be used within a DialogStack");
    }

    if (!context.isOpen) {
        return null;
    }

    return (
        <DialogStackContext.Provider
            value={{
                ...context,
                totalDialogs,
                setTotalDialogs,
            }}
        >
            <Portal.Root>
                <div
                    ref={ref}
                    className={cn(
                        "pointer-events-none fixed inset-0 z-50 mx-auto flex w-full max-w-lg flex-col items-center justify-center",
                        className,
                    )}
                    {...props}
                    role="dialog"
                    data-state={context.isOpen ? "open" : "closed"}
                    tabIndex={-1}
                >
                    <div className="pointer-events-auto relative flex w-full flex-col items-center justify-center">
                        {Children.map(children, (child, index) =>
                            cloneElement(child as ReactElement, { index }),
                        )}
                    </div>
                </div>
            </Portal.Root>
        </DialogStackContext.Provider>
    );
});
DialogStackBody.displayName = "DialogStackBody";

const DialogStackContent = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement> & {
        index?: number;
        offset?: number;
    }
>(({ children, className, index = 0, offset = 10, ...props }, ref) => {
    const context = useContext(DialogStackContext);

    if (!context) {
        throw new Error("DialogStackContent must be used within a DialogStack");
    }

    if (!context.isOpen) {
        return null;
    }

    const handleClick = () => {
        if (context.clickable && context.activeIndex > index) {
            context.setActiveIndex(index ?? 0);
        }
    };

    const distanceFromActive = index - context.activeIndex;
    const translateY =
        distanceFromActive < 0
            ? `-${Math.abs(distanceFromActive) * offset}px`
            : `${Math.abs(distanceFromActive) * offset}px`;

    return (
        <div
            onClick={handleClick}
            ref={ref}
            className={cn(
                "size-full rounded-[22px] border bg-background p-2 shadow-lg transition-all duration-300",
                className,
            )}
            style={{
                top: 0,
                transform: `translateY(${translateY})`,
                width: `calc(100% - ${Math.abs(distanceFromActive) * 10}px)`,
                zIndex: 50 - Math.abs(context.activeIndex - (index ?? 0)),
                position: distanceFromActive ? "absolute" : "relative",
                opacity: distanceFromActive > 0 ? 0 : 1,
                cursor:
                    context.clickable && context.activeIndex > index
                        ? "pointer"
                        : "default",
            }}
            {...props}
            data-state={context.activeIndex === index ? "open" : "closed"}
        >
            <div
                className={cn(
                    "size-full rounded-[inherit] p-4 space-y-2 transition-all duration-300",
                    context.activeIndex !== index &&
                        "pointer-events-none select-none opacity-0",
                )}
                data-state={context.activeIndex === index ? "open" : "closed"}
            >
                {children}
            </div>
        </div>
    );
});
DialogStackContent.displayName = "DialogStackContent";

const DialogStackHeader = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "flex flex-col space-y-1.5 text-center sm:text-left",
                className,
            )}
            {...props}
        />
    );
});
DialogStackHeader.displayName = "DialogStackHeader";

const DialogStackFooter = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "flex items-center justify-end space-x-2 pt-4",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
});
DialogStackFooter.displayName = "DialogStackFooter";

const DialogStackNext = forwardRef<
    HTMLButtonElement,
    {
        asChild?: boolean;
    } & HTMLAttributes<HTMLButtonElement>
>(({ children, className, asChild, ...props }, ref) => {
    const context = useContext(DialogStackContext);

    if (!context) {
        throw new Error("DialogStackNext must be used within a DialogStack");
    }

    const handleNext = () => {
        if (context.activeIndex < context.totalDialogs - 1) {
            context.setActiveIndex(context.activeIndex + 1);
        }
    };

    if (asChild && children) {
        return cloneElement(children as ReactElement, {
            onClick: handleNext,
            className: cn(
                className,
                (
                    (children as ReactElement).props as {
                        className?: string;
                    }
                ).className,
            ),
            ...props,
        });
    }

    return (
        <button
            type="button"
            onClick={handleNext}
            ref={ref}
            className={cn(
                buttonVariants({
                    variant: "ghost",
                }),
                className,
            )}
            disabled={context.activeIndex >= context.totalDialogs - 1}
            {...props}
        >
            {children ?? "Next"}
        </button>
    );
});
DialogStackNext.displayName = "DialogStackNext";

const DialogStackPrevious = forwardRef<
    HTMLButtonElement,
    {
        asChild?: boolean;
    } & HTMLAttributes<HTMLButtonElement>
>(({ children, className, asChild, ...props }, ref) => {
    const context = useContext(DialogStackContext);

    if (!context) {
        throw new Error(
            "DialogStackPrevious must be used within a DialogStack",
        );
    }

    const handlePrevious = () => {
        if (context.activeIndex > 0) {
            context.setActiveIndex(context.activeIndex - 1);
        }
    };

    if (asChild && children) {
        return cloneElement(children as ReactElement, {
            onClick: handlePrevious,
            className: cn(
                className,
                (
                    (children as ReactElement).props as {
                        className?: string;
                    }
                ).className,
            ),
            ...props,
        });
    }

    return (
        <button
            type="button"
            onClick={handlePrevious}
            ref={ref}
            className={cn(
                buttonVariants({
                    variant: "ghost",
                }),
                className,
            )}
            disabled={context.activeIndex <= 0}
            {...props}
        >
            {children ?? "Previous"}
        </button>
    );
});
DialogStackPrevious.displayName = "DialogStackPrevious";

export {
    DialogStack,
    DialogStackTrigger,
    DialogStackOverlay,
    DialogStackBody,
    DialogStackContent,
    DialogStackHeader,
    DialogStackFooter,
    DialogStackNext,
    DialogStackPrevious,
    DialogStackContext,
};
