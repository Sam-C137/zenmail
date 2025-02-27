import { useQueryState } from "nuqs";
import { doneState, tabState } from "@/lib/state";
import { useTheme } from "next-themes";
import { type Action, Priority } from "kbar";
import { useAccount } from "@/hooks/api/use-account";

export function useActions() {
    const [, setTab] = useQueryState(...tabState);
    const [, setDone] = useQueryState(...doneState);
    const { resolvedTheme: theme, setTheme } = useTheme();
    const { accounts, setSelectedAccountId } = useAccount();

    const actions: Action[] = [
        {
            id: "inboxAction",
            name: "Inbox",
            shortcut: ["g", "i"],
            section: "Navigation",
            subtitle: "View your inbox",
            perform: async () => {
                await setTab("inbox");
            },
        },
        {
            id: "draftAction",
            name: "Draft",
            shortcut: ["g", "d"],
            section: "Navigation",
            subtitle: "View your drafts",
            perform: async () => {
                await setTab("draft");
            },
        },
        {
            id: "sentAction",
            name: "Sent",
            shortcut: ["g", "s"],
            section: "Navigation",
            subtitle: "View your sent emails",
            perform: async () => {
                await setTab("sent");
            },
        },
        {
            id: "trashAction",
            name: "Trash",
            shortcut: ["g", "t"],
            section: "Navigation",
            subtitle: "View your trash",
            perform: async () => {
                await setTab("trash");
            },
        },
        {
            id: "starredAction",
            name: "Starred",
            shortcut: ["g", "q"],
            section: "Navigation",
            subtitle: "View your starred emails",
            perform: async () => {
                await setTab("starred");
            },
        },
        {
            id: "doneAction",
            name: "Done Tab",
            section: "Navigation",
            subtitle: "View your done threads",
            perform: async () => {
                await setDone(true);
            },
        },
        {
            id: "pendingAction",
            name: "Pending Tab",
            section: "Navigation",
            subtitle: "View your pending threads",
            perform: async () => {
                await setDone(false);
            },
        },
        {
            id: "toggleTheme",
            name: "Toggle Theme",
            section: "Theme",
            shortcut: ["t", "d"],
            subtitle: "Toggle between light and dark mode",
            perform: () => {
                setTheme(theme === "dark" ? "light" : "dark");
            },
        },
        {
            id: "setLightTheme",
            name: "Set Light Theme",
            section: "Theme",
            subtitle: "Set light theme",
            perform: () => {
                setTheme("light");
            },
        },
        {
            id: "setDarkTheme",
            name: "Set Dark Theme",
            section: "Theme",
            subtitle: "Set dark theme",
            perform: () => {
                setTheme("dark");
            },
        },
        {
            id: "accountsAction",
            name: "Switch Account",
            shortcut: ["e", "s"],
            section: "Accounts",
            subtitle: "Switch between accounts",
        },
    ].concat(
        accounts.map((account) => {
            return {
                id: account.id,
                name: account.name,
                section: "Accounts",
                parent: "accountsAction",
                subtitle: account.emailAddress,
                perform: () => {
                    setSelectedAccountId(account.id);
                },
                keywords: [account.emailAddress, account.name],
                priority: Priority.NORMAL,
            };
        }),
    );

    return [actions];
}
