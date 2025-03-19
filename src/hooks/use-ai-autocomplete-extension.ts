import { suggestAutocomplete } from "@/app/(protected)/mail/@components/@reply/actions";
import { processAICompletion, streamAIOutput } from "@/lib/utils";
import { Text } from "@tiptap/extension-text";
import { useRef } from "react";

export function useAIAutocompleteExtension() {
    const aiContext = useRef<string>("");
    const autoComplete = async (value: string) => {
        const { error, output } = await suggestAutocomplete(
            value,
            aiContext.current,
        );
        if (error || !output) return "";
        let out = "";
        for await (const line of streamAIOutput(output)) {
            out += line;
        }
        return out;
    };

    const AutoCompleteText = Text.extend({
        addKeyboardShortcuts() {
            return {
                "Mod-y": ({ editor }) => {
                    autoComplete(editor.getText())
                        .then((value) => {
                            if (value) {
                                editor.commands.setContent(
                                    processAICompletion(
                                        editor.getText(),
                                        value,
                                    ),
                                );
                            }
                        })
                        .catch(console.warn);
                    return true;
                },
            };
        },
    });

    return {
        AutoCompleteText,
        setAIContext: (value: string | ((v: string) => string)) => {
            aiContext.current =
                typeof value === "function" ? value(aiContext.current) : value;
        },
    };
}
