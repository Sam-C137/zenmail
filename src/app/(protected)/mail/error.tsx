"use client";

import React, { Component, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface MailErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function MailErrorPage({ error, reset }: MailErrorPageProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="grid place-items-center">
            <h1>Something went wrong.</h1>
            <Button onClick={() => reset()}>Try again</Button>
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
