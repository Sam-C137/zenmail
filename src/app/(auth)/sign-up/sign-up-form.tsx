"use client";

import { useForm } from "react-hook-form";
import { arktypeResolver } from "@hookform/resolvers/arktype";
import { OTPSchema, SignUpSchema } from "@/lib/validators";
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
import { useState, useTransition } from "react";
import {
    type ButtonStates,
    SubmitButton,
} from "@/app/(auth)/@components/submit-button";
import {
    confirmOtp,
    register,
    verifyEmail,
} from "@/app/(auth)/sign-up/actions";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { AnimatePresence, motion } from "motion/react";
import { sleep } from "@/lib/utils";

export function SignUpForm() {
    const [registrationStage, setRegistrationStage] = useState<
        "email" | "otp" | "credentials"
    >("email");
    const [email, setEmail] = useState<string>("");

    const stageMapping = {
        email: (
            <EmailForm
                onEmailSent={(email) => {
                    setEmail(email);
                    setRegistrationStage("otp");
                }}
            />
        ),
        otp: (
            <OTPForm
                onOtpConfirmed={() => {
                    setRegistrationStage("credentials");
                }}
                email={email}
            />
        ),
        credentials: <RegisterForm email={email} />,
    };

    return (
        <div className="relative overflow-hidden w-full">
            <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                    key={registrationStage}
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
                    {stageMapping[registrationStage]}
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
        resolver: arktypeResolver(SignUpSchema.pick("email")),
        defaultValues: {
            email: "",
        },
    });
    const [error, setError] = useState<string>();
    const [buttonState, setButtonState] = useState<ButtonStates>("idle");

    async function onSubmit({ email }: { email: string }) {
        setButtonState("loading");
        const { error } = await verifyEmail({ email });

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
    onOtpConfirmed: () => void;
    email: string;
}
function OTPForm({ onOtpConfirmed, email }: OTPFormProps) {
    const form = useForm({
        resolver: arktypeResolver(OTPSchema),
        defaultValues: {
            code: "",
            email: email,
        },
    });
    const [isPending, startTransition] = useTransition();

    function onSubmit(payload: typeof OTPSchema.infer) {
        startTransition(async () => {
            const { error } = await confirmOtp(payload);
            if (error) {
                form.setError("code", { message: error });
                return;
            }
            onOtpConfirmed();
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

interface RegisterFormProps {
    email: string;
}
function RegisterForm({ email }: RegisterFormProps) {
    const form = useForm({
        resolver: arktypeResolver(SignUpSchema.omit("email")),
        defaultValues: {
            password: "",
            firstName: "",
            email,
        },
    });
    const [error, setError] = useState<string>();
    const [isPending, startTransition] = useTransition();

    function onSubmit(credentials: typeof SignUpSchema.infer) {
        startTransition(async () => {
            const { error } = await register(credentials);
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
                    name="firstName"
                    render={({ field }) => (
                        <FormItem className="relative flex h-[40px] flex-col justify-center items-center">
                            <FloatingLabelInput
                                {...field}
                                id="userName"
                                label="First Name"
                                type="text"
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
                <SubmitButton
                    variant="outline"
                    className="w-full"
                    buttonState={isPending ? "loading" : "idle"}
                    buttonStateMapping={{
                        idle: "Sign Up",
                        success: "Sign up success!",
                    }}
                />
            </form>
        </Form>
    );
}
