"use client";

import React, { Component, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface MailErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function MailErrorPage({ error, reset }: MailErrorPageProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="grid h-screen place-items-center">
            <div className="flex flex-col gap-4 items-center">
                <h1>Something went wrong.</h1>
                <Button onClick={() => reset()} variant="ghost">
                    <RotateCcw className="size-4" />
                    Try again
                </Button>
            </div>
        </main>
    );
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export class InitialSyncErrorBoundary extends Component<
    React.PropsWithChildren,
    ErrorBoundaryState
> {
    constructor(props: React.PropsWithChildren) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        console.error(error);
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="grid h-screen place-items-center font-semibold">
                    Failed to load your mail. Please try again.
                </main>
            );
        }

        return <>{this.props.children}</>;
    }
}
