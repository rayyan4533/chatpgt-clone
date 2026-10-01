"use server";

import { requireUser } from "@/features/auth/actions/require-user";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM" | "TOOL";
export type MessageStatus = "PENDING" | "COMPLETE" | "ERROR";

export type MessageItem = {
    id: string;
    conversationId: string;
    role: MessageRole;
    status: MessageStatus;
    content: string;
    createdAt: string;
    updatedAt: string;
};

async function assertOwnsConversation(conversationId: string, userId: number) {
    const conversation = await db.orm.public.Conversation
        .where({ id: conversationId, userId })
        .first();

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    return conversation;
}

/** Load messages for a conversation (oldest → newest). */
export async function listMessages(
    conversationId: string
): Promise<MessageItem[]> {
    const user = await requireUser();
    await assertOwnsConversation(conversationId, user.id);

    return await db.orm.public.Message
        .where({ conversationId })
        .orderBy((m) => m.createdAt.asc())
        .select(
            "id",
            "conversationId",
            "role",
            "status",
            "content",
            "createdAt",
            "updatedAt"
        )
        .all();
}

/**
 * Create a user message in a conversation.
 * No AI reply yet — this only persists the user's text.
 * Optionally renames "New Chat" using the first message.
 */
export async function createMessage(conversationId: string, content: string) {
    const user = await requireUser();
    const conversation = await assertOwnsConversation(conversationId, user.id);

    const trimmed = content.trim();
    if (!trimmed) {
        throw new Error("Message cannot be empty");
    }

    const message = await db.orm.public.Message.create({
        conversationId,
        role: "USER",
        status: "COMPLETE",
        content: trimmed,
    });

    const shouldRename =
        conversation.title === "New Chat" || conversation.title.trim() === "";

    const updateData: { lastMessageAt: string; title?: string } = {
        lastMessageAt: new Date().toISOString(),
    };

    if (shouldRename) {
        updateData.title =
            trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
    }

    await db.orm.public.Conversation
        .where({ id: conversationId })
        .update(updateData);

    revalidatePath("/");
    revalidatePath(`/c/${conversationId}`);
    return message;
}

/** Update message text (e.g. edit). */
export async function updateMessage(messageId: string, content: string) {
    const user = await requireUser();
    const trimmed = content.trim();

    if (!trimmed) {
        throw new Error("Message cannot be empty");
    }

    const existing = await db.orm.public.Message
        .where({ id: messageId })
        .include("conversation")
        .first();

    if (!existing || existing.conversation.userId !== user.id) {
        throw new Error("Message not found");
    }

    const message = await db.orm.public.Message
        .where({ id: messageId })
        .update({ content: trimmed });

    revalidatePath(`/c/${existing.conversationId}`);
    return message;
}

/** Delete a single message. */
export async function deleteMessage(messageId: string) {
    const user = await requireUser();

    const existing = await db.orm.public.Message
        .where({ id: messageId })
        .include("conversation")
        .first();

    if (!existing || existing.conversation.userId !== user.id) {
        throw new Error("Message not found");
    }

    await db.orm.public.Message
        .where({ id: messageId })
        .delete();

    revalidatePath(`/c/${existing.conversationId}`);
    return { id: messageId, conversationId: existing.conversationId };
}
