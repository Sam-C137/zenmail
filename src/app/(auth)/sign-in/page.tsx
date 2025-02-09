import { GoogleButton } from "@/app/(auth)/sign-in/google/google-button";
import { GithubButton } from "@/app/(auth)/sign-in/github/github-button";

export default function Page() {
    return (
        <main className="h-[100dvh] w-screen grid place-items-center">
            <GoogleButton />
            <GithubButton />
        </main>
    );
}
