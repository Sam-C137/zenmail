import { validateRequest } from "@/server/session";
import { redirect } from "next/navigation";
import SessionProvider from "@/app/session-provider";

export default async function Layout({ children }: React.PropsWithChildren) {
    const session = await validateRequest();
    if (!session.user) {
        return redirect("/sign-in");
    }

    return <SessionProvider value={session}>{children}</SessionProvider>;
}
