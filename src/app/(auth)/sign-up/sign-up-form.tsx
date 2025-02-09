"use client";

import { useForm } from "react-hook-form";
import { arktypeResolver } from "@hookform/resolvers/arktype";
import { SignUpSchema } from "@/lib/validators";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { useState, useTransition } from "react";
import { SubmitButton } from "@/app/(auth)/@components/submit-button";
import { register } from "@/app/(auth)/sign-up/actions";

export function SignUpForm() {
    const form = useForm<typeof SignUpSchema.infer>({
        resolver: arktypeResolver(SignUpSchema),
        defaultValues: {
            firstName: "",
            email: "",
            password: "",
        },
        mode: "onSubmit",
    });
    const [error, setError] = useState<string>();
    const [isPending, startTransition] = useTransition();

    async function onSubmit(credentials: typeof SignUpSchema.infer) {
        startTransition(async () => {
            const { error } = await register(credentials);
            if (error) setError(error);
        });
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center gap-5 flex-col w-full"
            >
                {error && (
                    <p className="text-center text-[1rem] text-destructive">
                        {error}
                    </p>
                )}
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem className="relative w-full">
                            <FloatingLabelInput
                                {...field}
                                id="userName"
                                label="First Name"
                                type="text"
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="relative w-full">
                            <FloatingLabelInput
                                {...field}
                                id="email"
                                label="Email"
                                type="email"
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="relative w-full">
                            <FloatingLabelInput
                                {...field}
                                id="password"
                                label="Password"
                                type="password"
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <SubmitButton
                    variant="outline"
                    className="w-full"
                    buttonState={isPending ? "loading" : "idle"}
                    buttonStateMapping={{
                        idle: "Continue",
                        success: "Sign up success!",
                    }}
                />
            </form>
        </Form>
    );
}
