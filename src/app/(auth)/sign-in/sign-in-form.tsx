"use client";

import {
    type ButtonStates,
    SubmitButton,
} from "@/app/(auth)/@components/submit-button";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { arktypeResolver } from "@hookform/resolvers/arktype";
import { SignInSchema } from "@/lib/validators";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { AnimatePresence, motion } from "motion/react";
import { login, verifyUser } from "@/app/(auth)/sign-in/actions";
import { sleep } from "@/lib/utils";

export function SignInForm() {
    const form = useForm<typeof SignInSchema.infer>({
        resolver: arktypeResolver(SignInSchema),
        defaultValues: {
            email: "",
            password: "12345",
        },
        mode: "onSubmit",
    });
    const [buttonState, setButtonState] = useState<ButtonStates>("idle");
    const [step, setStep] = useState<"email" | "password">("email");
    const [userName, setUserName] = useState<string>();
    const [isPending, startTransition] = useTransition();

    async function onSubmit(credentials: typeof SignInSchema.infer) {
        if (buttonState === "success") return;

        const actions = {
            email: async function () {
                const result = await verifyUser(credentials.email);
                if (result.success) {
                    setUserName(result.userName);
                    setStep("password");
                    setButtonState("success");
                    form.reset({ password: "", email: result.email });
                } else {
                    form.setError("email", {
                        type: "manual",
                        message: result.error,
                    });
                }
            },
            password: async function () {
                const { error } = await login(credentials);
                if (error) {
                    form.setError("password", {
                        type: "manual",
                        message: error,
                    });
                    return;
                }
                setButtonState("success");
            },
        };

        setButtonState("loading");
        startTransition(async () => {
            await actions[step]();
            await sleep(1500);
            setButtonState("idle");
        });
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center gap-5 flex-col w-full overflow-hidden"
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {step === "email" ? (
                        <motion.div
                            key="email"
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                                type: "spring",
                                bounce: 0,
                                duration: 0.4,
                            }}
                            className="w-full h-[40px] flex flex-col justify-center items-center"
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="w-[99%] relative">
                                        <FloatingLabelInput
                                            {...field}
                                            id="email"
                                            label="Email"
                                            type="email"
                                        />
                                        <FormMessage className="absolute line-clamp-1 truncate -bottom-5" />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="password"
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                                type: "spring",
                                bounce: 0,
                                duration: 0.4,
                            }}
                            className="w-full h-[40px] flex flex-col justify-center items-center"
                        >
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="w-[99%] relative">
                                        <FloatingLabelInput
                                            {...field}
                                            id="password"
                                            label="Password"
                                            type="password"
                                        />
                                        <FormMessage className="absolute -bottom-5" />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                <SubmitButton
                    variant="outline"
                    className="w-[99%]"
                    buttonState={buttonState}
                    disabled={isPending}
                    buttonStateMapping={{
                        idle: "Continue",
                        success: `Welcome ${userName}!`,
                    }}
                />
            </form>
        </Form>
    );
}
