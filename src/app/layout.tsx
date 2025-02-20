import "@/styles/globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "next-themes";

export function generateMetadata(): Metadata {
    const getTitlePrefix = () => {
        const hour = new Date().getHours();
        if (hour < 6) return "🌙 Midnight Inbox";
        if (hour < 12) return "🌞 Morning Emails";
        if (hour < 18) return "☕ Afternoon Mail";
        return "🌃 Late Night Mail";
    };

    return {
        title: {
            template: `${getTitlePrefix()} | %s | zenmail`,
            default: "zenmail | Stay Focused",
        },
        description: "The minimalistic email client",
        icons: [{ rel: "icon", url: "/favicon.ico" }],
    };
}

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            suppressHydrationWarning
            lang="en"
            className={`${GeistSans.variable}`}
        >
            <body>
                <TRPCReactProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <NuqsAdapter>{children}</NuqsAdapter>
                    </ThemeProvider>
                </TRPCReactProvider>
            </body>
        </html>
    );
}
