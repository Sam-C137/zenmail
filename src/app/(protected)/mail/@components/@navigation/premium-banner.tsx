import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/server/stripe.actions";
import Image from "next/image";
import bot from "public/static/bot.webp";
import { app } from "@/lib/constants";

export function PremiumBanner() {
    const isSubscribed = false;
    const rem = 5;

    if (!isSubscribed) {
        return (
            <div className="bg-foreground dark:bg-muted mx-2 mb-4 relative p-4 rounded-lg border overflow-hidden flex flex-col md:flex-row gap-4">
                <Image
                    src={bot}
                    alt="Premium ai bot"
                    className="md:absolute md:-bottom-6 md:-right-10 h-[180px] w-auto"
                />
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="font-semibold text-white">Basic Plan</h1>
                        <p className="text-muted-foreground text-sm md:max-w-full">
                            {rem} / {app.Feature.AiChat.FreeCreditsPerDay}{" "}
                            messages remaining
                        </p>
                    </div>
                    <p className="text-muted-foreground text-sm my-4 md:max-w-[calc(100%-100px)]">
                        Upgrade to premium for unlimited messages and access to
                        advanced features.
                    </p>
                    <StripeButton />
                </div>
            </div>
        );
    }
    return <div className="font-semibold mx-2 mb-4">Premium banner</div>;
}

export function StripeButton() {
    const isSubscribed = false;

    return (
        <Button
            variant="outline"
            size="lg"
            onClick={createCheckoutSession}
            effect="gooeyRight"
        >
            {isSubscribed ? "Manage Subscription" : "Upgrade to Premium"}
        </Button>
    );
}
