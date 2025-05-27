"use server";

import { validateRequest } from "@/server/session";
import { stripe } from "@/server/stripe";
import { env } from "@/env";
import { redirect } from "next/navigation";

export async function createCheckoutSession() {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized");
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price: "price_1RJG41PqxAs2Gi0DaZlZLEp7",
                quantity: 1,
            },
        ],
        mode: "subscription",
        success_url: `${env.NEXT_PUBLIC_URL}/mail`,
        cancel_url: `${env.NEXT_PUBLIC_URL}/mail`,
        client_reference_id: user.id.toString(),
    });
    if (session.url != null) {
        redirect(session.url);
    }
}
