import { db } from "@/server/db";

interface UserCreatedEvent {
    data: {
        email_addresses: {
            email_address: string;
            id: string;
        }[];
        external_accounts: [];
        external_id: string;
        first_name: string;
        gender: string;
        id: string;
        image_url: string;
        last_name: string;
        phone_numbers: [];
        profile_image_url: string;
        two_factor_enabled: boolean;
        updated_at: number;
        username: string | null;
    };
}

export async function POST(req: Request) {
    try {
        const { data } = (await req.json()) as UserCreatedEvent;
        const { email_addresses, first_name, last_name, image_url, id } = data;

        await db.user.create({
            data: {
                id,
                email: email_addresses[0]?.email_address ?? "",
                firstName: first_name,
                lastName: last_name,
                imageUrl: image_url,
            },
        });

        return new Response("ok", { status: 200 });
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
            return new Response(e.message, { status: 500 });
        }
    }
}
