import { type } from "arktype";

export const SignInSchema = type({
    email: "string.email",
    password: "string>4",
});

export const SignUpSchema = type({
    email: "string.email",
    password: type("string>4").configure({
        actual: () => "",
    }),
    firstName: type("string>1 & string.alpha").configure({
        message: () => "Only letters, numbers, - and _ allowed",
    }),
});
