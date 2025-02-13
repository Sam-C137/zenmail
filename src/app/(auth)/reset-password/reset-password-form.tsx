"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { arktypeResolver } from "@hookform/resolvers/arktype";
import {
    type ButtonStates,
    SubmitButton,
} from "@/app/(auth)/@components/submit-button";
import { sleep } from "@/lib/utils";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import {
    requestPasswordReset,
    resetPassword,
    verifyPasswordResetOtp,
} from "@/app/(auth)/reset-password/actions";
import { type } from "arktype";
import { OTPSchema, ResetPasswordSchema } from "@/lib/validators";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { AnimatePresence, motion } from "motion/react";

export function ResetPasswordForm() {
    const [resetStage, setResetStage] = useState<"email" | "otp" | "password">(
        "email",
    );
    const [userId, setUserId] = useState(0);
    const [email, setEmail] = useState("");

    const stageMapping = {
        email: (
            <EmailForm
                onEmailSent={(email) => {
                    setEmail(email);
                    setResetStage("otp");
                }}
            />
        ),
        otp: (
            <OTPForm
                email={email}
                onOtpConfirmed={(userId) => {
                    setUserId(userId);
                    setResetStage("password");
                }}
            />
        ),
        password: <PasswordFieldsForm userId={userId} />,
    };

    return (
        <div className="relative overflow-hidden w-full">
            <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                    key={resetStage}
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                    }}
                    className="w-full"
                >
                    {stageMapping[resetStage]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

interface EmailFormProps {
    onEmailSent: (email: string) => void;
}
function EmailForm({ onEmailSent }: EmailFormProps) {
    const form = useForm({
        resolver: arktypeResolver(
            type({
                email: "string.email",
            }),
        ),
        defaultValues: {
            email: "",
        },
    });
    const [error, setError] = useState<string>();
    const [buttonState, setButtonState] = useState<ButtonStates>("idle");

    async function onSubmit({ email }: { email: string }) {
        setButtonState("loading");
        const { error } = await requestPasswordReset({ email });

        if (error) {
            setError(error);
            setButtonState("idle");
            return;
        }

        setButtonState("success");
        await sleep(1500);
        onEmailSent(email);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                    <p className="text-center text-[1rem] text-destructive">
                        {error}
                    </p>
                )}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="relative flex h-[40px] flex-col justify-center items-center">
                            <FloatingLabelInput
                                {...field}
                                id="email"
                                label="Email"
                                type="email"
                                classNames={{
                                    input: "w-full",
                                    wrapper: "w-[99%] mx-auto",
                                }}
                            />
                            <FormMessage className="absolute line-clamp-1 truncate -bottom-5" />
                        </FormItem>
                    )}
                />
                <SubmitButton
                    variant="outline"
                    className="w-full"
                    buttonState={buttonState}
                    buttonStateMapping={{
                        idle: "Continue",
                        success: "Verification Code Sent!",
                    }}
                />
            </form>
        </Form>
    );
}

interface OTPFormProps {
    onOtpConfirmed: (userId: number) => void;
    email: string;
}
function OTPForm({ onOtpConfirmed, email }: OTPFormProps) {
    const form = useForm({
        resolver: arktypeResolver(OTPSchema),
        defaultValues: {
            code: "",
            email,
        },
    });
    const [isPending, startTransition] = useTransition();

    function onSubmit(payload: typeof OTPSchema.infer) {
        startTransition(async () => {
            const { error, userId } = await verifyPasswordResetOtp(payload);
            if (error || !userId) {
                form.setError("code", { message: error });
                return;
            }
            onOtpConfirmed(userId);
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-center flex-col gap-2 relative w-full">
                            <FormLabel>Verification Code</FormLabel>
                            <FormControl>
                                <InputOTP
                                    disabled={isPending}
                                    maxLength={6}
                                    {...field}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </FormControl>
                            <FormDescription>
                                Please enter the one-time password sent to your
                                email.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}

interface PasswordFieldsFormProps {
    userId: number;
}
function PasswordFieldsForm({ userId }: PasswordFieldsFormProps) {
    const form = useForm({
        resolver: arktypeResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            passwordConfirm: "",
            userId,
        },
    });
    const [error, setError] = useState<string>();
    const [isPending, startTransition] = useTransition();

    function onSubmit(credentials: typeof ResetPasswordSchema.infer) {
        startTransition(async () => {
            const { error } = await resetPassword(credentials);
            if (error) setError(error);
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                    <p className="text-center text-[1rem] text-destructive">
                        {error}
                    </p>
                )}
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="relative flex h-[40px] flex-col justify-center items-center">
                            <FloatingLabelInput
                                {...field}
                                id="password"
                                label="Password"
                                type="password"
                                classNames={{
                                    input: "w-full",
                                    wrapper: "w-[99%] mx-auto",
                                }}
                            />
                            <FormMessage className="absolute -bottom-5" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="passwordConfirm"
                    render={({ field }) => (
                        <FormItem className="relative flex h-[40px] flex-col justify-center items-center">
                            <FloatingLabelInput
                                {...field}
                                id="passwordConfirm"
                                label="Confirm Password"
                                type="password"
                                classNames={{
                                    input: "w-full",
                                    wrapper: "w-[99%] mx-auto",
                                }}
                            />
                            <FormMessage className="absolute -bottom-5" />
                        </FormItem>
                    )}
                />
                <SubmitButton
                    variant="outline"
                    className="w-full"
                    buttonState={isPending ? "loading" : "idle"}
                    buttonStateMapping={{
                        idle: "Confirm",
                        success: "Password Reset!",
                    }}
                />
            </form>
        </Form>
    );
}
