import { Suspense } from "react";
import React from "react";
import { InitialSync } from "./@components/initial-sync";
import { MailContent } from "./@components/mail-content";
import { InitialSyncErrorBoundary } from "./error";
import MailLoadingPage from "./loading";

export default function MailPage() {
    return (
        <main>
            <InitialSyncErrorBoundary>
                <Suspense fallback={<MailLoadingPage />}>
                    <InitialSync>
                        <MailContent navCollapsedSize={4} />
                    </InitialSync>
                </Suspense>
            </InitialSyncErrorBoundary>
        </main>
    );
}
