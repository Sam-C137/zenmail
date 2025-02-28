import {
    useMatches,
    KBarResults as RootResults,
    type ActionImpl,
    type ActionId,
} from "kbar";
import { motion } from "motion/react";
import React from "react";

export function KBarResults() {
    const { results, rootActionId } = useMatches();

    return (
        <RootResults
            items={results}
            onRender={({ item, active }) =>
                typeof item === "string" ? (
                    <div className="px-4 py-2 text-sm opacity-50">{item}</div>
                ) : (
                    <KbarResultItem
                        action={item}
                        active={active}
                        currentRootActionId={rootActionId ?? ""}
                    />
                )
            }
        />
    );
}

export interface KbarResultItemProps {
    action: ActionImpl;
    active: boolean;
    currentRootActionId: ActionId;
}

const KbarResultItem = React.forwardRef<HTMLDivElement, KbarResultItemProps>(
    ({ action, active, currentRootActionId }, ref) => {
        const ancestors = React.useMemo(() => {
            if (!currentRootActionId) return action.ancestors;
            const index = action.ancestors.findIndex(
                (ancestor) => ancestor.id === currentRootActionId,
            );
            return action.ancestors.slice(index + 1);
        }, [action.ancestors, currentRootActionId]);

        return (
            <div
                ref={ref}
                className="px-4 py-2 flex items-center justify-between cursor-pointer relative z-10"
            >
                {active && (
                    <motion.div
                        layoutId="kbar-result-item"
                        className="bg-muted border-l-4 rounded border-foreground absolute inset-0 !z-[-1]"
                        transition={{
                            duration: 0.25,
                            type: "spring",
                            bounce: 0,
                        }}
                    />
                )}
                <div className="flex gap-2 items-center relative z-10">
                    {action.icon && action.icon}
                    <div className="flex flex-col">
                        <div>
                            {ancestors.length > 0 &&
                                ancestors.map((ancestor) => (
                                    <React.Fragment key={ancestor.id}>
                                        <span className="opacity-50 mr-2">
                                            {ancestor.name}
                                        </span>
                                        <span className="mr-2">&rsaquo;</span>
                                    </React.Fragment>
                                ))}
                            <span className="text-sm font-semibold">
                                {action.name}
                            </span>
                        </div>
                        {action.subtitle && (
                            <span className="text-xs text-secondary-foreground dark:text-[#a0a0a0]">
                                {action.subtitle}
                            </span>
                        )}
                    </div>
                </div>
                {action.shortcut && action.shortcut.length > 0 && (
                    <div className="grid grid-flow-col gap-1 relative z-10">
                        {action.shortcut.map((sc) => (
                            <kbd
                                key={sc}
                                className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-1 border border-gray-200 dark:border-gray-700 shadow font-medium rounded-md text-xs flex items-center gap-1"
                            >
                                {sc}
                            </kbd>
                        ))}
                    </div>
                )}
            </div>
        );
    },
);
KbarResultItem.displayName = "KbarResultItem";
