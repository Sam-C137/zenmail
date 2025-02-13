"use client";

import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { getAurinkoAuthUrl } from "@/server/aurinko.actions";

export default function Home() {
    return (
        <main>
            Hello foo
            <button onClick={logout}>Logout</button>
            <LinkAccount />
        </main>
    );
}

function LinkAccount() {
    return (
        <Button
            onClick={async () => {
                const url = await getAurinkoAuthUrl("Google");
                window.location.href = url;
            }}
        >
            Link Account
        </Button>
    );
}
