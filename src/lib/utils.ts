import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import DOMPurify from "dompurify";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            resolve((reader.result as string).split(",")[1]!);
        };
        reader.onerror = () => {
            reject(new Error("Error executing ftoBase64"));
        };
    });
}

export function formatSize(sizeInBytes: number) {
    const units = ["Bytes", "kB", "MB", "GB", "TB"];
    let i = 0;
    let size = sizeInBytes;

    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }

    return `${size.toFixed(2)} ${units[i]}`;
}

export function htmlToText(html: string) {
    html = DOMPurify.sanitize(html, {});

    const doc = new DOMParser().parseFromString(html, "text/html");

    const extractText = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent?.trim() ?? "";
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;

            if (element.tagName === "A") {
                return ` [${element.textContent?.trim()}] (link here) `;
            }

            if (["SCRIPT", "STYLE", "IMG"].includes(element.tagName)) {
                return "";
            }

            return Array.from(node.childNodes).map(extractText).join(" ");
        }

        return "";
    };

    return extractText(doc.body).replace(/\s+/g, " ").trim();
}
