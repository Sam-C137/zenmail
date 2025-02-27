import { parseAsBoolean, type UseQueryStateOptions } from "nuqs";
import type { EmailLabel } from "@prisma/client";
import { type } from "arktype";

export const tabState: [
    key: string,
    options: UseQueryStateOptions<EmailLabel | "starred"> & {
        defaultValue: EmailLabel | "starred";
    },
] = [
    "tab" as const,
    {
        defaultValue: "inbox",
        parse: (value: unknown) => {
            const parsed = type(
                "'trash' | 'sent' | 'inbox' | 'draft' | 'starred'",
            )(value);
            if (parsed instanceof type.errors) {
                return "inbox";
            }
            return parsed;
        },
    },
];

export const doneState: [
    key: string,
    options: UseQueryStateOptions<boolean> & {
        defaultValue: boolean;
    },
] = ["done", parseAsBoolean.withDefault(false)];
