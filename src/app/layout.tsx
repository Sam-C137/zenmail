import "@/styles/globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { env } from "@/env";

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
        metadataBase: new URL(env.NEXT_PUBLIC_URL),
        description: "The minimalistic email client",
        icons: [
            { rel: "icon", url: "/favicon.ico" },
            {
                rel: "apple-touch-icon",
                url: "/apple-touch-icon.png",
                sizes: "180x180",
            },
            {
                rel: "icon",
                url: "/favicon-32x32.png",
                sizes: "32x32",
            },
            {
                rel: "icon",
                url: "/favicon-16x16.png",
                sizes: "16x16",
            },
        ],
        manifest: `${env.NEXT_PUBLIC_URL}/site.webmanifest`,
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
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <NuqsAdapter>{children}</NuqsAdapter>
                        <Toaster />
                    </ThemeProvider>
                </TRPCReactProvider>
            </body>
        </html>
    );
}
