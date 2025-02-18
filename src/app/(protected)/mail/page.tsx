import { Suspense } from "react";
import { InitialSync } from "./initial-sync";
import React from "react";
import { MailContent } from "@/app/(protected)/mail/mail-content";
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
