import "server-only";
import type {
    EmailAddress,
    EmailAttachment,
    EmailMessage,
} from "@/lib/email.types";
import pLimit from "p-limit";
import { type EmailLabel } from "@prisma/client";
import { db } from "@/server/db";

type Email = typeof EmailMessage.infer;
type Address = typeof EmailAddress.infer;
type Attachment = typeof EmailAttachment.infer;

export async function syncEmailsToDatabase(emails: Email[], accountId: string) {
    const limit = pLimit(10);
    let allSuccessful = true;
    const processedThreadIds = new Set<string>();

    try {
        const uniqueAddresses = new Map<string, Address>();
        for (const email of emails) {
            for (const address of [
                email.from,
                ...email.to,
                ...email.cc,
                ...email.bcc,
                ...email.replyTo,
            ]) {
                if (!uniqueAddresses.has(address.address)) {
                    uniqueAddresses.set(address.address, address);
                } else {
                    uniqueAddresses.set(address.address, {
                        ...uniqueAddresses.get(address.address),
                        ...address,
                    });
                }
            }
        }

        const addressResults = await Promise.all(
            Array.from(uniqueAddresses.values()).map((address) =>
                limit(() => upsertEmailAddress(address, accountId)),
            ),
        );

        const addressLookup = new Map<
            string,
            (typeof addressResults)[number]
        >();
        for (const result of addressResults) {
            if (result) {
                addressLookup.set(result.address, result);
            }
        }

        await Promise.all(
            emails.map((email) =>
                limit(async () => {
                    const result = await upsertEmail(
                        email,
                        accountId,
                        addressLookup,
                    );
                    if (result === null) {
                        allSuccessful = false;
                    } else {
                        processedThreadIds.add(email.threadId);
                    }
                }),
            ),
        );

        if (processedThreadIds.size > 0) {
            await Promise.all(
                Array.from(processedThreadIds).map((threadId) =>
                    limit(() => updateThreadDeletionStatus(threadId)),
                ),
            );
        }

        if (allSuccessful) {
            await db.account.update({
                where: { id: accountId },
                data: { initialSyncStatus: "Completed" },
            });
        }
    } catch (e) {
        console.error("Error syncing emails to database", e);
        return null;
    }
}

async function upsertEmail(
    email: Email,
    accountId: string,
    addressLookup: Map<string, Awaited<ReturnType<typeof upsertEmailAddress>>>,
) {
    try {
        let label: EmailLabel = "inbox";
        if (
            email.sysLabels.includes("inbox") ||
            email.sysLabels.includes("important")
        ) {
            label = "inbox";
        } else if (email.sysLabels.includes("sent")) {
            label = "sent";
        } else if (email.sysLabels.includes("draft")) {
            label = "draft";
        } else if (email.sysLabels.includes("trash")) {
            label = "trash";
        }
        const isDeleted = email.sysLabels.includes("trash");

        const from = addressLookup.get(email.from.address);
        if (!from) {
            throw new Error(
                "From address missing in lookup: " + email.from.address,
            );
        }

        const to = email.to
            .map((address) => addressLookup.get(address.address))
            .filter(Boolean);
        const cc = email.cc
            .map((address) => addressLookup.get(address.address))
            .filter(Boolean);
        const bcc = email.bcc
            .map((address) => addressLookup.get(address.address))
            .filter(Boolean);
        const replyTo = email.replyTo
            .map((address) => addressLookup.get(address.address))
            .filter(Boolean);

        // update thread
        const thread = await db.thread.upsert({
            where: { id: email.threadId },
            update: {
                subject: email.subject,
                accountId,
                lastMessageDate: new Date(email.sentAt),
                done: false,
                participantIds: [
                    ...new Set([
                        from.id,
                        ...to.map((a) => a!.id),
                        ...cc.map((a) => a!.id),
                        ...bcc.map((a) => a!.id),
                    ]),
                ],
            },
            create: {
                id: email.threadId,
                subject: email.subject,
                accountId,
                lastMessageDate: new Date(email.sentAt),
                draftStatus: label === "draft",
                inboxStatus: label === "inbox",
                sentStatus: label === "sent",
                done: false,
                isDeleted: false,
                participantIds: [
                    from.id,
                    ...to.map((a) => a!.id),
                    ...cc.map((a) => a!.id),
                    ...bcc.map((a) => a!.id),
                ],
            },
        });

        // update email
        await db.email.upsert({
            where: { internetMessageId: email.internetMessageId },
            update: {
                threadId: thread.id,
                createdTime: new Date(email.createdTime),
                lastModifiedTime: new Date(),
                sentAt: new Date(email.sentAt),
                receivedAt: new Date(email.receivedAt),
                internetMessageId: email.internetMessageId,
                subject: email.subject,
                sysLabels: email.sysLabels,
                keywords: email.keywords,
                sysClassifications: email.sysClassifications,
                sensitivity: email.sensitivity,
                meetingMessageMethod: email.meetingMessageMethod,
                to: { set: to.map((a) => ({ id: a?.id })) },
                cc: { set: cc.map((a) => ({ id: a?.id })) },
                bcc: { set: bcc.map((a) => ({ id: a?.id })) },
                replyTo: { set: replyTo.map((a) => ({ id: a?.id })) },
                hasAttachments: email.hasAttachments,
                internetHeaders: email.internetHeaders,
                body: email.body,
                bodySnippet: email.bodySnippet,
                inReplyTo: email.inReplyTo,
                references: email.references,
                threadIndex: email.threadIndex,
                nativeProperties: email.nativeProperties,
                folderId: email.folderId,
                omitted: email.omitted,
                emailLabel: label,
                deletedAt: isDeleted ? new Date() : null,
                isDeleted,
            },
            create: {
                id: email.id,
                threadId: thread.id,
                createdTime: new Date(email.createdTime),
                lastModifiedTime: new Date(),
                sentAt: new Date(email.sentAt),
                receivedAt: new Date(email.receivedAt),
                internetMessageId: email.internetMessageId,
                subject: email.subject,
                sysLabels: email.sysLabels,
                internetHeaders: email.internetHeaders,
                keywords: email.keywords,
                sysClassifications: email.sysClassifications,
                sensitivity: email.sensitivity,
                meetingMessageMethod: email.meetingMessageMethod,
                fromId: from.id,
                to: { connect: to.map((a) => ({ id: a?.id })) },
                cc: { connect: cc.map((a) => ({ id: a?.id })) },
                bcc: { connect: bcc.map((a) => ({ id: a?.id })) },
                replyTo: { connect: replyTo.map((a) => ({ id: a?.id })) },
                hasAttachments: email.hasAttachments,
                body: email.body,
                bodySnippet: email.bodySnippet,
                inReplyTo: email.inReplyTo,
                references: email.references,
                threadIndex: email.threadIndex,
                nativeProperties: email.nativeProperties,
                folderId: email.folderId,
                omitted: email.omitted,
                emailLabel: label,
                deletedAt: isDeleted ? new Date() : null,
                isDeleted,
            },
        });

        const threadEmails = await db.email.findMany({
            where: { threadId: thread.id },
            orderBy: { receivedAt: "asc" },
        });
        let threadFolderType: EmailLabel = "sent";
        const activeEmails = threadEmails.filter(
            (e) => !e.isDeleted && e.emailLabel !== "trash",
        );
        for (const threadEmail of threadEmails) {
            if (threadEmail.emailLabel === "inbox" && !threadEmail.isDeleted) {
                threadFolderType = "inbox";
                break;
            } else if (
                threadEmail.emailLabel === "draft" &&
                !threadEmail.isDeleted
            ) {
                threadFolderType = "draft";
            }
        }

        await db.thread.update({
            where: { id: thread.id },
            data: {
                draftStatus: threadFolderType === "draft",
                inboxStatus: threadFolderType === "inbox",
                sentStatus: threadFolderType === "sent",
                isDeleted: activeEmails.length === 0,
                deletedAt: activeEmails.length === 0 ? new Date() : null,
            },
        });

        for (const attachment of email.attachments) {
            await upsertAttachment(email.id, attachment);
        }
    } catch (e) {
        console.error("Error upserting email", e);
        return null;
    }
}

async function updateThreadDeletionStatus(threadId: string) {
    try {
        const activeEmailsCount = await db.email.count({
            where: {
                threadId,
                isDeleted: false,
                emailLabel: { not: "trash" },
            },
        });

        await db.thread.update({
            where: { id: threadId },
            data: {
                isDeleted: activeEmailsCount === 0,
                deletedAt: activeEmailsCount === 0 ? new Date() : null,
            },
        });
    } catch (e) {
        console.error(
            `Error updating thread deletion status for ${threadId}`,
            e,
        );
    }
}

async function upsertEmailAddress(address: Address, accountId: string) {
    try {
        return await db.$transaction(async (tx) => {
            return tx.emailAddress.upsert({
                where: {
                    accountId_address: {
                        accountId,
                        address: address.address,
                    },
                },
                update: {
                    name: address.name,
                    raw: address.raw,
                },
                create: {
                    name: address.name,
                    address: address.address,
                    raw: address.raw,
                    accountId,
                },
            });
        });
    } catch (e) {
        console.error("Error upserting email address", e);
        return null;
    }
}

async function upsertAttachment(emailId: string, attachment: Attachment) {
    try {
        await db.emailAttachment.upsert({
            where: { id: attachment.id },
            update: {
                name: attachment.name,
                mimeType: attachment.mimeType,
                size: attachment.size,
                inline: attachment.inline,
                contentId: attachment.contentId,
                contentLocation: attachment.contentLocation,
            },
            create: {
                id: attachment.id,
                name: attachment.name,
                mimeType: attachment.mimeType,
                size: attachment.size,
                inline: attachment.inline,
                contentId: attachment.contentId,
                contentLocation: attachment.contentLocation,
                emailId,
            },
        });
    } catch (e) {
        console.error("Error upserting attachment", e);
        return null;
    }
}
