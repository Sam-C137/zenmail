export const publicRoutes = [
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/",
    "/api/email/sync",
];

export function isPublicRoute(url: string): boolean {
    return publicRoutes.some((route) => new RegExp(route).test(url));
}
