import { logout } from "@/app/(auth)/actions";

export default async function Home() {
    return (
        <main>
            Hello foo
            <button onClick={logout}>Logout</button>
        </main>
    );
}
