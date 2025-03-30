import { parseAsBoolean, type UseQueryStateOptions } from "nuqs";
import type { EmailLabel } from "@prisma/client";
import { type } from "arktype";
import { keys } from "@/lib/constants";

type QueryState<T> = [
    key: string,
    options: UseQueryStateOptions<T> & {
        defaultValue: T;
    },
];

export const tabState: QueryState<EmailLabel | "starred"> = [
    keys.QueryParams.Tab,
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

export const doneState: QueryState<boolean> = [
    keys.QueryParams.Done,
    parseAsBoolean.withDefault(false),
];
