"use client";

import Image, { type ImageProps } from "next/image";
import { useTheme } from "next-themes";

export function GoogleIcon({
    width = 16,
    height = 16,
    ...props
}: Omit<ImageProps, "src" | "alt">) {
    const { resolvedTheme } = useTheme();
    const icon =
        resolvedTheme === "dark" ? "google-icon.svg" : "google-icon-mono.svg";

    return (
        <Image
            src={`/static/${icon}`}
            alt="google"
            width={width}
            height={height}
            unoptimized
            {...props}
        />
    );
}
