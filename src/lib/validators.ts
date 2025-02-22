import { type } from "arktype";

const email$ = type("string.email").configure({
    message: (ctx) => `Email must be a valid email (was ${ctx.actual})`,
});
const password$ = type("string>6").configure({
    actual: () => "",
    message: (ctx) => `Password must be ${ctx.expected}`,
});

export const SignInSchema = type({
    email: email$,
    password: password$,
});

export const OTPSchema = type({
    code: "5<string.numeric<7",
    email: email$,
});

export const SignUpSchema = type({
    email: "string.email",
    password: password$,
    firstName: type("string>1 & string.alpha").configure({
        message: () => "Only alphabetic characters allowed",
    }),
});

export const ResetPasswordSchema = type({
    userId: "number",
    password: password$,
    passwordConfirm: password$,
}).narrow((data, ctx) => {
    if (data.password === data.passwordConfirm) {
        return true;
    }
    return ctx.reject({
        expected: "identical to password",
        actual: "",
        path: ["passwordConfirm"],
    });
});
