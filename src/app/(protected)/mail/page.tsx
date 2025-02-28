import { Suspense } from "react";
import React from "react";
import { type Metadata } from "next";
import { InitialSync } from "./@components/initial-sync";
import { MailContent } from "./@components/mail-content";
import { InitialSyncErrorBoundary } from "./error";
import MailLoadingPage from "./loading";
import { validateRequest } from "@/server/session";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import KBar from "@/components/kbar";

interface MailPageProps {
    searchParams: Promise<{
        tab?: string;
    }>;
}

export async function generateMetadata({
    searchParams,
}: MailPageProps): Promise<Metadata> {
    const { tab } = await searchParams;
    return {
        title: tab ? tab.at(0)?.toUpperCase() + tab.slice(1) : "Inbox",
    };
}

export default async function MailPage() {
    const { user } = await validateRequest();
    if (!user) return redirect("/sign-in");

    const userAccount = await db.account.findFirst({
        where: {
            userId: user.id,
        },
    });

    return (
        <main>
            <InitialSyncErrorBoundary>
                <Suspense
                    fallback={
                        <MailLoadingPage
                            isInitialSync={
                                userAccount?.initialSyncStatus === "Pending"
                            }
                        />
                    }
                >
                    <InitialSync userAccount={userAccount}>
                        <KBar>
                            <MailContent navCollapsedSize={4} />
                        </KBar>
                    </InitialSync>
                </Suspense>
            </InitialSyncErrorBoundary>
        </main>
    );
}
