import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <main className="h-[100dvh] w-screen grid place-items-center">
            <SignUp />
        </main>
    );
}
