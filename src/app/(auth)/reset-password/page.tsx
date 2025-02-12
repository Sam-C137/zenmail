import Link from "next/link";
import { ResetPasswordForm } from "@/app/(auth)/reset-password/reset-password-form";

export default function Page() {
    return (
        <main className="h-[100dvh] w-screen grid place-items-center">
            <section className="rounded-lg bg-background w-[90vw] max-w-[25rem] shadow-lg border border-muted flex flex-col">
                <div className="w-full space-y-6 p-6">
                    <div>
                        <h1 className="text-center text-lg mb-1 font-bold">
                            Reset your password
                        </h1>
                        <p className="text-center text-sm text-muted-foreground">
                            Let&#39;s help you get back into your account.
                        </p>
                    </div>
                    <ResetPasswordForm />
                    <Link
                        href="/sign-in"
                        className="text-sm text-right text-muted-foreground block !mt-2 hover:underline"
                    >
                        Back to login
                    </Link>
                </div>
                <hr />
                <div className="p-6 w-full text-sm text-muted-foreground text-center">
                    Don&#39;t have an account?{" "}
                    <Link
                        href="/sign-up"
                        className="font-semibold hover:underline text-foreground"
                    >
                        Sign up
                    </Link>
                </div>
            </section>
        </main>
    );
}
