import {
    Body,
    Column,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";
import { env } from "@/env";

interface ResetPasswordEmailProps {
    code: string;
}

const baseUrl = env.NEXT_PUBLIC_URL;

export function ResetPasswordEmail({ code }: ResetPasswordEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Reset your password</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={logoContainer}>
                        {/*<Img*/}
                        {/*    src={`${baseUrl}/static/logo.png`}*/}
                        {/*    width="120"*/}
                        {/*    height="36"*/}
                        {/*    alt="Logo"*/}
                        {/*/>*/}
                        zenmail
                    </Section>
                    <Heading style={h1}>Reset your password</Heading>
                    <Text style={heroText}>
                        Your verification code is below - enter it in your open
                        browser window and {"we'll"} help you get back into your
                        account.
                    </Text>

                    <Section style={codeBox}>
                        <Text style={confirmationCodeText}>{code}</Text>
                    </Section>

                    <Text style={text}>
                        If you {"didn't"} request this email, {"there's"}{" "}
                        nothing to worry about, you can safely ignore it.
                    </Text>

                    <Section>
                        <Row style={footerLogos}>
                            <Column
                                style={{
                                    ...logoContainer,
                                    marginTop: "0",
                                    width: "66%",
                                }}
                            >
                                {/*<Img*/}
                                {/*    src={`${baseUrl}/static/logo.png`}*/}
                                {/*    width="120"*/}
                                {/*    height="36"*/}
                                {/*    alt="logo"*/}
                                {/*/>*/}
                                zenmail
                            </Column>
                            <Column>
                                <Section>
                                    <Row>
                                        <Column>
                                            <Link href="/https://github.com/Sam-C137">
                                                <Img
                                                    src={`${baseUrl}/static/github-icon.png`}
                                                    width="32"
                                                    height="32"
                                                    alt="Sam-C137"
                                                    style={socialMediaIcon}
                                                />
                                            </Link>
                                        </Column>
                                    </Row>
                                </Section>
                            </Column>
                        </Row>
                    </Section>

                    <Section>
                        <Text style={footerText}>
                            ©{new Date().getFullYear()} zenmail inc, LLC, a
                            Non-FAANG company. <br />
                            500 Basement Street, Nowhere <br />
                            <br />
                            All rights reserved.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

export default ResetPasswordEmail;

const footerText = {
    fontSize: "12px",
    color: "#b7b7b7",
    lineHeight: "15px",
    textAlign: "left" as const,
    marginBottom: "50px",
};

const footerLink = {
    color: "#b7b7b7",
    textDecoration: "underline",
};

const footerLogos = {
    marginBottom: "32px",
    paddingLeft: "8px",
    paddingRight: "8px",
    width: "100%",
};

const socialMediaIcon = {
    display: "inline",
    marginLeft: "32px",
};

const main = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
    margin: "0 auto",
    padding: "0px 20px",
};

const logoContainer = {
    marginTop: "32px",
    fontFamily: "Hellix Sans, sans-serif",
    color: "#1d1c1d",
    fontSize: "36px",
    fontWeight: "700",
};

const h1 = {
    color: "#1d1c1d",
    fontSize: "36px",
    fontWeight: "700",
    margin: "30px 0",
    padding: "0",
    lineHeight: "42px",
};

const heroText = {
    fontSize: "20px",
    lineHeight: "28px",
    marginBottom: "30px",
};

const codeBox = {
    background: "rgb(245, 244, 245)",
    borderRadius: "4px",
    marginBottom: "30px",
    padding: "40px 10px",
};

const confirmationCodeText = {
    fontSize: "30px",
    textAlign: "center" as const,
    verticalAlign: "middle",
};

const text = {
    color: "#000",
    fontSize: "14px",
    lineHeight: "24px",
};
