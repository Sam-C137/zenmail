import { useState } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/use-Isomorphic-layout-effect";

export type DeviceType =
    | "Windows"
    | "Mac"
    | "Linux"
    | "iOS"
    | "Android"
    | "ChromeOS"
    | "Unknown";

export function useDeviceType() {
    const [device, setDevice] = useState<DeviceType>("Unknown");

    useIsomorphicLayoutEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (userAgent.includes("win")) {
            setDevice("Windows");
        } else if (userAgent.includes("mac")) {
            setDevice("Mac");
        } else if (userAgent.includes("linux")) {
            setDevice("Linux");
        } else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
            setDevice("iOS");
        } else if (userAgent.includes("android")) {
            setDevice("Android");
        } else if (userAgent.includes("cros")) {
            setDevice("ChromeOS");
        } else {
            setDevice("Unknown");
        }
    }, []);

    return device;
}
