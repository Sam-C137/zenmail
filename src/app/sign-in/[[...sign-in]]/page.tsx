import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <main className="h-[100dvh] w-screen grid place-items-center">
            <SignIn />
        </main>
    );
}
