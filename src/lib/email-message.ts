import { type } from "arktype";

export const EmailAddress = type({
    "name?": "string",
    address: "string.email",
    "raw?": "string",
});

export const EmailAttachment = type({
    id: "string",
    name: "string",
    mimeType: "string",
    size: "number",
    inline: "boolean",
    contentId: "string",
    content: "string",
    contentLocation: "string",
});

export const EmailHeader = type({
    name: "string",
    value: "string",
});

export const EmailMessage = type({
    id: "string",
    threadId: "string",
    createdTime: "string",
    "lastModifiedTime?": "string",
    sentAt: "string",
    receivedAt: "string",
    internetMessageId: "string",
    subject: "string",
    sysLabels: type(
        "'junk' | 'trash' | 'sent' | 'inbox' | 'unread' | 'flagged' | 'important' | 'draft'",
    ).array(),
    keywords: "string[]",
    sysClassifications: type(
        "'personal' | 'social' | 'promotions' | 'updates' | 'forums'",
    ).array(),
    sensitivity: type("'normal' | 'private' | 'personal' | 'confidential'"),
    "meetingMessageMethod?": type(
        "'request' | 'reply' | 'cancel' | 'counter' | 'other'",
    ),
    from: EmailAddress,
    to: EmailAddress.array(),
    cc: EmailAddress.array(),
    bcc: EmailAddress.array(),
    replyTo: EmailAddress.array(),
    hasAttachments: "boolean",
    body: "string",
    bodySnippet: "string",
    attachments: EmailAttachment.array(),
    "inReplyTo?": "string",
    "references?": "string",
    "threadIndex?": "string",
    internetHeaders: EmailHeader.array(),
    "nativeProperties?": "object",
    folderId: "string",
    webLink: "string",
    omitted: type(
        "'threadId' | 'body' | 'attachments' | 'recipients' | 'internetHeaders'",
    ).array(),
});
