import { type } from "arktype";

export const SignInSchema = type({
    email: "string.email",
    password: "string>4",
});

export const OTPSchema = type({
    code: "5<string.numeric<7",
    email: "string.email",
});

export const SignUpSchema = type({
    email: "string.email",
    password: type("string>4").configure({
        actual: () => "",
    }),
    firstName: type("string>1 & string.alpha").configure({
        message: () => "Only alphabetic characters allowed",
    }),
});
