import { GoogleButton } from "@/app/(auth)/sign-in/google/google-button";
import { GithubButton } from "@/app/(auth)/sign-in/github/github-button";
import { MicrosoftButton } from "@/app/(auth)/sign-in/microsoft/microsoft-button";
import { SignInForm } from "@/app/(auth)/sign-in/sign-in-form";
import Link from "next/link";

export default function Page() {
    return (
        <main className="h-[100dvh] w-screen grid place-items-center">
            <section className="rounded-lg bg-background w-[90vw] max-w-[25rem] shadow-lg border border-muted flex flex-col">
                <div className="w-full space-y-6 p-6">
                    <div>
                        <h1 className="text-center text-lg mb-1 font-bold">
                            Sign in to zenmail
                        </h1>
                        <p className="text-center text-sm text-muted-foreground">
                            Welcome back! Please sign in to continue
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <GoogleButton />
                        <MicrosoftButton />
                        <GithubButton />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-muted"></div>
                        <span className="text-muted-foreground">or</span>
                        <div className="h-px flex-1 bg-muted"></div>
                    </div>
                    <SignInForm />
                    <Link
                        href="/reset-password"
                        className="text-sm text-right text-muted-foreground block !mt-2 hover:underline"
                    >
                        I forgot my password
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
