import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import DOMPurify from "dompurify";
import { distance as levenshtein } from "./levenshtein-distance";

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

/**
 * Filters key events against global shortcut event listeners
 * @param e
 */
export function filterKeyEvents(e: React.KeyboardEvent) {
    switch (e.key) {
        case "Escape":
        case "Delete":
            e.stopPropagation();
    }

    if (e.shiftKey) {
        switch (e.key) {
            case "ArrowDown":
            case "ArrowUp":
                e.stopPropagation();
        }
    }

    if (e.ctrlKey && e.key === "a") {
        e.stopPropagation();
    }
}

export function processAICompletion(userInput: string, aiOutput: string) {
    if (aiOutput.startsWith(userInput)) {
        return userInput + aiOutput.slice(userInput.length);
    }

    if (aiOutput.length < userInput.length) {
        return userInput + aiOutput;
    }

    const distance = levenshtein(userInput, aiOutput);
    const changeRatio = distance / userInput.length;

    // If AI rewrote more than 30%, assume it's a better version → REPLACE
    return changeRatio > 0.3
        ? aiOutput
        : userInput + aiOutput.slice(userInput.length);
}

export async function* streamAIOutput(stream: ReadableStream<Uint8Array>) {
    const decoder = new TextDecoder();
    const reader = stream.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const line = decoder.decode(value);
        if (line.startsWith("0")) {
            yield line.substring(3, line.length - 2).replace(/\\n/g, "\n");
        }
    }
}
