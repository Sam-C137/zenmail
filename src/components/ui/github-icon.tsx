"use client";

import Image, { type ImageProps } from "next/image";
import { useTheme } from "next-themes";

export function GithubIcon({
    width = 16,
    height = 16,
    ...props
}: Omit<ImageProps, "src" | "alt">) {
    const { resolvedTheme } = useTheme();
    const icon =
        resolvedTheme === "dark" ? "github-icon.svg" : "github-icon-mono.svg";

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
